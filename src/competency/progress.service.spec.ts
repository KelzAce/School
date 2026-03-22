import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { ProgressService } from './progress.service';
import { MasteryRecord } from './entities/mastery-record.entity';
import { CourseSkill } from '../skills/entities/course-skill.entity';
import { StudentSkill } from '../skills/entities/student-skill.entity';
import { ProficiencyLevel } from '../skills/entities/skill-enums';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid-1';
const studentProfileId = 'student-uuid-1';
const courseId = 'course-uuid-1';
const skillId = 'skill-uuid-1';

describe('ProgressService', () => {
  let service: ProgressService;
  let masteryRepo: MockRepository<MasteryRecord>;
  let courseSkillRepo: MockRepository<CourseSkill>;
  let studentSkillRepo: MockRepository<StudentSkill>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: getRepositoryToken(MasteryRecord),
          useValue: createMockRepository<MasteryRecord>(),
        },
        {
          provide: getRepositoryToken(CourseSkill),
          useValue: createMockRepository<CourseSkill>(),
        },
        {
          provide: getRepositoryToken(StudentSkill),
          useValue: createMockRepository<StudentSkill>(),
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    masteryRepo = module.get(getRepositoryToken(MasteryRecord));
    courseSkillRepo = module.get(getRepositoryToken(CourseSkill));
    studentSkillRepo = module.get(getRepositoryToken(StudentSkill));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStudentProgress', () => {
    it('should return an empty summary when no skills tracked', async () => {
      studentSkillRepo.find!.mockResolvedValue([]);
      masteryRepo.find!.mockResolvedValue([]);
      courseSkillRepo.find!.mockResolvedValue([]);

      const result = await service.getStudentProgress(
        tenantId,
        studentProfileId,
      );
      expect(result.studentProfileId).toBe(studentProfileId);
      expect(result.totalSkillsTracked).toBe(0);
      expect(result.totalMasteries).toBe(0);
      expect(result.overallProgressPercent).toBe(0);
      expect(result.courseProgress).toEqual([]);
    });

    it('should calculate progress correctly with mastered skills', async () => {
      studentSkillRepo.find!.mockResolvedValue([
        {
          skillId,
          currentLevel: ProficiencyLevel.INTERMEDIATE,
          skill: { name: 'Welding', code: 'WLD-001' },
        },
      ]);
      masteryRepo.find!.mockResolvedValue([
        {
          skillId,
          level: ProficiencyLevel.BEGINNER,
          achievedAt: new Date('2026-01-01'),
        },
        {
          skillId,
          level: ProficiencyLevel.INTERMEDIATE,
          achievedAt: new Date('2026-02-01'),
        },
      ]);
      courseSkillRepo.find!.mockResolvedValue([
        {
          courseId,
          skillId,
          targetLevel: ProficiencyLevel.INTERMEDIATE,
          isPrimary: true,
          skill: { name: 'Welding', code: 'WLD-001' },
          course: { title: 'Welding 101', code: 'WLD-101' },
        },
      ]);

      const result = await service.getStudentProgress(
        tenantId,
        studentProfileId,
      );
      expect(result.totalSkillsTracked).toBe(1);
      expect(result.totalMasteries).toBe(2);
      expect(result.courseProgress).toHaveLength(1);
      expect(result.courseProgress[0].masteredSkills).toBe(1);
      expect(result.courseProgress[0].progressPercent).toBe(100);
    });

    it('should report 0% when target not yet met', async () => {
      studentSkillRepo.find!.mockResolvedValue([
        {
          skillId,
          currentLevel: ProficiencyLevel.BEGINNER,
          skill: { name: 'Welding', code: 'WLD-001' },
        },
      ]);
      masteryRepo.find!.mockResolvedValue([
        {
          skillId,
          level: ProficiencyLevel.BEGINNER,
          achievedAt: new Date(),
        },
      ]);
      courseSkillRepo.find!.mockResolvedValue([
        {
          courseId,
          skillId,
          targetLevel: ProficiencyLevel.ADVANCED,
          skill: { name: 'Welding', code: 'WLD-001' },
          course: { title: 'Welding 101', code: 'WLD-101' },
        },
      ]);

      const result = await service.getStudentProgress(
        tenantId,
        studentProfileId,
      );
      expect(result.courseProgress[0].masteredSkills).toBe(0);
      expect(result.courseProgress[0].progressPercent).toBe(0);
    });

    it('should populate levelDistribution', async () => {
      studentSkillRepo.find!.mockResolvedValue([
        { skillId: 'a', currentLevel: ProficiencyLevel.BEGINNER, skill: {} },
        { skillId: 'b', currentLevel: ProficiencyLevel.BEGINNER, skill: {} },
        {
          skillId: 'c',
          currentLevel: ProficiencyLevel.INTERMEDIATE,
          skill: {},
        },
      ]);
      masteryRepo.find!.mockResolvedValue([]);
      courseSkillRepo.find!.mockResolvedValue([]);

      const result = await service.getStudentProgress(
        tenantId,
        studentProfileId,
      );
      expect(result.levelDistribution[ProficiencyLevel.BEGINNER]).toBe(2);
      expect(result.levelDistribution[ProficiencyLevel.INTERMEDIATE]).toBe(1);
      expect(result.levelDistribution[ProficiencyLevel.NOVICE]).toBe(0);
    });
  });

  describe('getCourseProgress', () => {
    it('should return course progress for a student', async () => {
      courseSkillRepo.find!.mockResolvedValue([
        {
          courseId,
          skillId,
          targetLevel: ProficiencyLevel.INTERMEDIATE,
          skill: { name: 'Welding', code: 'WLD-001' },
          course: { title: 'Welding 101', code: 'WLD-101' },
        },
      ]);
      studentSkillRepo.find!.mockResolvedValue([
        { skillId, currentLevel: ProficiencyLevel.INTERMEDIATE },
      ]);
      masteryRepo.find!.mockResolvedValue([
        {
          skillId,
          level: ProficiencyLevel.INTERMEDIATE,
          achievedAt: new Date(),
        },
      ]);

      const result = await service.getCourseProgress(
        tenantId,
        courseId,
        studentProfileId,
      );
      expect(result.courseId).toBe(courseId);
      expect(result.totalSkills).toBe(1);
      expect(result.masteredSkills).toBe(1);
      expect(result.progressPercent).toBe(100);
      expect(result.skills[0].isMastered).toBe(true);
    });

    it('should handle a course with no skills', async () => {
      courseSkillRepo.find!.mockResolvedValue([]);
      studentSkillRepo.find!.mockResolvedValue([]);
      masteryRepo.find!.mockResolvedValue([]);

      const result = await service.getCourseProgress(
        tenantId,
        courseId,
        studentProfileId,
      );
      expect(result.totalSkills).toBe(0);
      expect(result.progressPercent).toBe(0);
    });
  });

  describe('getMasteryTimeline', () => {
    it('should return mastery records ordered by achievedAt', async () => {
      const records = [
        {
          id: 'mr-1',
          skillId,
          level: ProficiencyLevel.BEGINNER,
          achievedAt: new Date('2026-01-01'),
        },
        {
          id: 'mr-2',
          skillId,
          level: ProficiencyLevel.INTERMEDIATE,
          achievedAt: new Date('2026-02-01'),
        },
      ];
      masteryRepo.find!.mockResolvedValue(records);

      const result = await service.getMasteryTimeline(
        tenantId,
        studentProfileId,
      );
      expect(result).toHaveLength(2);
      expect(result[0].level).toBe(ProficiencyLevel.BEGINNER);
    });
  });
});
