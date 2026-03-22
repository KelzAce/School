import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SkillMappingsService } from './skill-mappings.service';
import { CourseSkill } from './entities/course-skill.entity';
import { StudentSkill } from './entities/student-skill.entity';
import { ProficiencyLevel } from './entities/skill.entity';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

describe('SkillMappingsService', () => {
  let service: SkillMappingsService;
  let courseSkillRepo: MockRepository<CourseSkill>;
  let studentSkillRepo: MockRepository<StudentSkill>;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const courseId = '00000000-0000-0000-0000-000000000030';
  const skillId = '00000000-0000-0000-0000-000000000020';
  const studentProfileId = '00000000-0000-0000-0000-000000000040';

  const mockCourseSkill: CourseSkill = {
    id: '00000000-0000-0000-0000-000000000050',
    tenantId,
    courseId,
    skillId,
    targetLevel: ProficiencyLevel.INTERMEDIATE,
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: null as any,
    course: null as any,
    skill: null as any,
  } as CourseSkill;

  const mockStudentSkill: StudentSkill = {
    id: '00000000-0000-0000-0000-000000000060',
    tenantId,
    studentProfileId,
    skillId,
    currentLevel: ProficiencyLevel.BEGINNER,
    verifiedBy: null,
    verifiedAt: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: null as any,
    studentProfile: null as any,
    skill: null as any,
  } as StudentSkill;

  beforeEach(async () => {
    courseSkillRepo = createMockRepository();
    studentSkillRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillMappingsService,
        {
          provide: getRepositoryToken(CourseSkill),
          useValue: courseSkillRepo,
        },
        {
          provide: getRepositoryToken(StudentSkill),
          useValue: studentSkillRepo,
        },
      ],
    }).compile();

    service = module.get<SkillMappingsService>(SkillMappingsService);
  });

  /* ---- Course-Skill ---- */

  describe('mapSkillToCourse', () => {
    it('should create a course-skill mapping', async () => {
      courseSkillRepo.findOne!.mockResolvedValue(null);
      courseSkillRepo.create!.mockReturnValue(mockCourseSkill);
      courseSkillRepo.save!.mockResolvedValue(mockCourseSkill);

      const result = await service.mapSkillToCourse(tenantId, {
        courseId,
        skillId,
        targetLevel: 'intermediate',
        isPrimary: true,
      });

      expect(result).toEqual(mockCourseSkill);
    });

    it('should throw ConflictException for duplicate mapping', async () => {
      courseSkillRepo.findOne!.mockResolvedValue(mockCourseSkill);

      await expect(
        service.mapSkillToCourse(tenantId, { courseId, skillId }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findSkillsByCourse', () => {
    it('should return skills for a course', async () => {
      courseSkillRepo.find!.mockResolvedValue([mockCourseSkill]);

      const result = await service.findSkillsByCourse(tenantId, courseId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findCoursesBySkill', () => {
    it('should return courses for a skill', async () => {
      courseSkillRepo.find!.mockResolvedValue([mockCourseSkill]);

      const result = await service.findCoursesBySkill(tenantId, skillId);
      expect(result).toHaveLength(1);
    });
  });

  describe('removeCourseSkill', () => {
    it('should remove a mapping', async () => {
      courseSkillRepo.findOne!.mockResolvedValue(mockCourseSkill);
      courseSkillRepo.remove!.mockResolvedValue(mockCourseSkill);

      await expect(
        service.removeCourseSkill(tenantId, mockCourseSkill.id),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException for unknown mapping', async () => {
      courseSkillRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.removeCourseSkill(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /* ---- Student-Skill ---- */

  describe('recordStudentSkill', () => {
    it('should record a student skill', async () => {
      studentSkillRepo.findOne!.mockResolvedValue(null);
      studentSkillRepo.create!.mockReturnValue(mockStudentSkill);
      studentSkillRepo.save!.mockResolvedValue(mockStudentSkill);

      const result = await service.recordStudentSkill(tenantId, {
        studentProfileId,
        skillId,
      });

      expect(result).toEqual(mockStudentSkill);
    });

    it('should throw ConflictException for duplicate record', async () => {
      studentSkillRepo.findOne!.mockResolvedValue(mockStudentSkill);

      await expect(
        service.recordStudentSkill(tenantId, {
          studentProfileId,
          skillId,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findSkillsByStudent', () => {
    it('should return skills for a student', async () => {
      studentSkillRepo.find!.mockResolvedValue([mockStudentSkill]);

      const result = await service.findSkillsByStudent(
        tenantId,
        studentProfileId,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('updateStudentSkill', () => {
    it('should update a student skill level', async () => {
      const updated = {
        ...mockStudentSkill,
        currentLevel: ProficiencyLevel.INTERMEDIATE,
      };
      studentSkillRepo.findOne!.mockResolvedValue({ ...mockStudentSkill });
      studentSkillRepo.save!.mockResolvedValue(updated);

      const result = await service.updateStudentSkill(
        tenantId,
        mockStudentSkill.id,
        {
          currentLevel: 'intermediate',
          verifiedBy: 'instructor-assessment',
        },
      );
      expect(result.currentLevel).toBe(ProficiencyLevel.INTERMEDIATE);
    });

    it('should throw NotFoundException for unknown record', async () => {
      studentSkillRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.updateStudentSkill(tenantId, 'nonexistent', {
          currentLevel: 'advanced',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
