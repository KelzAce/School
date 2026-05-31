import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { Course, CourseStatus } from '../courses/entities/course.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { Enrollment } from '../students/entities/enrollment.entity.js';
import { CareerPathway } from '../career-pathways/entities/career-pathway.entity.js';
import { CareerPathwaySkill } from '../career-pathways/entities/career-pathway-skill.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { Program } from '../courses/entities/program.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';
import { UserRole } from '../users/entities/user.entity.js';

const createMockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
});

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let studentRepo: ReturnType<typeof createMockRepo>;
  let studentSkillRepo: ReturnType<typeof createMockRepo>;
  let masteryRepo: ReturnType<typeof createMockRepo>;
  let courseRepo: ReturnType<typeof createMockRepo>;
  let courseSkillRepo: ReturnType<typeof createMockRepo>;
  let enrollmentRepo: ReturnType<typeof createMockRepo>;
  let pathwayRepo: ReturnType<typeof createMockRepo>;
  let pathwaySkillRepo: ReturnType<typeof createMockRepo>;
  let skillRepo: ReturnType<typeof createMockRepo>;
  let programRepo: ReturnType<typeof createMockRepo>;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const studentProfileId = '00000000-0000-0000-0000-000000000002';
  const pathwayId = '00000000-0000-0000-0000-000000000003';
  const courseId = '00000000-0000-0000-0000-000000000004';
  const skillId1 = '00000000-0000-0000-0000-000000000005';
  const skillId2 = '00000000-0000-0000-0000-000000000006';
  const userId = '00000000-0000-0000-0000-000000000007';

  const mockStudent = { id: studentProfileId, tenantId, userId };
  const adminUser = { id: 'admin-id', role: UserRole.ADMIN } as any;
  const studentUser = { id: userId, role: UserRole.STUDENT } as any;
  const otherStudentUser = { id: 'other-user-id', role: UserRole.STUDENT } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: getRepositoryToken(StudentProfile), useValue: createMockRepo() },
        { provide: getRepositoryToken(StudentSkill), useValue: createMockRepo() },
        { provide: getRepositoryToken(MasteryRecord), useValue: createMockRepo() },
        { provide: getRepositoryToken(Course), useValue: createMockRepo() },
        { provide: getRepositoryToken(CourseSkill), useValue: createMockRepo() },
        { provide: getRepositoryToken(Enrollment), useValue: createMockRepo() },
        { provide: getRepositoryToken(CareerPathway), useValue: createMockRepo() },
        { provide: getRepositoryToken(CareerPathwaySkill), useValue: createMockRepo() },
        { provide: getRepositoryToken(Skill), useValue: createMockRepo() },
        { provide: getRepositoryToken(Program), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    studentRepo = module.get(getRepositoryToken(StudentProfile));
    studentSkillRepo = module.get(getRepositoryToken(StudentSkill));
    masteryRepo = module.get(getRepositoryToken(MasteryRecord));
    courseRepo = module.get(getRepositoryToken(Course));
    courseSkillRepo = module.get(getRepositoryToken(CourseSkill));
    enrollmentRepo = module.get(getRepositoryToken(Enrollment));
    pathwayRepo = module.get(getRepositoryToken(CareerPathway));
    pathwaySkillRepo = module.get(getRepositoryToken(CareerPathwaySkill));
    skillRepo = module.get(getRepositoryToken(Skill));
    programRepo = module.get(getRepositoryToken(Program));

    jest.clearAllMocks();
  });

  describe('getCourseRecommendations', () => {
    it('returns sorted recommendations when student has skill gaps', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);
      studentSkillRepo.find.mockResolvedValue([
        { skillId: skillId1, currentLevel: ProficiencyLevel.NOVICE },
      ]);
      masteryRepo.find.mockResolvedValue([]);
      courseRepo.find.mockResolvedValue([
        { id: courseId, code: 'CS-101', title: 'Intro to Programming', difficulty: 'beginner', learningTrack: 'STEM', status: CourseStatus.PUBLISHED },
      ]);
      courseSkillRepo.find.mockResolvedValue([
        {
          courseId,
          skillId: skillId1,
          targetLevel: ProficiencyLevel.INTERMEDIATE,
          isPrimary: true,
          skill: { code: 'PROG-001', name: 'Programming Basics' },
        },
      ]);
      pathwayRepo.find.mockResolvedValue([{ id: pathwayId, title: 'Software Dev', isPublished: true }]);
      pathwaySkillRepo.find.mockResolvedValue([
        { pathwayId, skillId: skillId1, requiredLevel: ProficiencyLevel.INTERMEDIATE, isCritical: true },
      ]);

      const result = await service.getCourseRecommendations(tenantId, studentProfileId, {}, adminUser);

      expect(result).toHaveLength(1);
      expect(result[0].courseId).toBe(courseId);
      expect(result[0].gapSkillsCovered).toBe(1);
      expect(result[0].criticalSkillsCovered).toBe(1);
      expect(result[0].score).toBeGreaterThan(0);
      expect(result[0].reasons.length).toBeGreaterThan(0);
    });

    it('returns empty array when no gaps (all skills mastered)', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);
      studentSkillRepo.find.mockResolvedValue([
        { skillId: skillId1, currentLevel: ProficiencyLevel.EXPERT },
      ]);
      masteryRepo.find.mockResolvedValue([]);
      courseRepo.find.mockResolvedValue([
        { id: courseId, code: 'CS-101', title: 'Intro', difficulty: 'beginner', learningTrack: 'STEM', status: CourseStatus.PUBLISHED },
      ]);
      courseSkillRepo.find.mockResolvedValue([
        {
          courseId,
          skillId: skillId1,
          targetLevel: ProficiencyLevel.BEGINNER,
          isPrimary: true,
          skill: { code: 'PROG-001', name: 'Programming Basics' },
        },
      ]);
      pathwayRepo.find.mockResolvedValue([{ id: pathwayId, title: 'Software Dev', isPublished: true }]);
      pathwaySkillRepo.find.mockResolvedValue([
        { pathwayId, skillId: skillId1, requiredLevel: ProficiencyLevel.INTERMEDIATE, isCritical: false },
      ]);

      const result = await service.getCourseRecommendations(tenantId, studentProfileId, {}, adminUser);
      expect(result).toEqual([]);
    });

    it('throws NotFoundException for unknown student', async () => {
      studentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getCourseRecommendations(tenantId, studentProfileId, {}, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when student queries another student', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);

      await expect(
        service.getCourseRecommendations(tenantId, studentProfileId, {}, otherStudentUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows a student to access their own recommendations', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);
      studentSkillRepo.find.mockResolvedValue([]);
      masteryRepo.find.mockResolvedValue([]);
      courseRepo.find.mockResolvedValue([]);
      pathwayRepo.find.mockResolvedValue([]);

      const result = await service.getCourseRecommendations(tenantId, studentProfileId, {}, studentUser);
      expect(result).toEqual([]);
    });

    it('filters by pathwayId when provided', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);
      studentSkillRepo.find.mockResolvedValue([]);
      masteryRepo.find.mockResolvedValue([]);
      courseRepo.find.mockResolvedValue([
        { id: courseId, code: 'CS-101', title: 'Intro', difficulty: 'beginner', learningTrack: 'STEM', status: CourseStatus.PUBLISHED },
      ]);
      courseSkillRepo.find.mockResolvedValue([
        {
          courseId,
          skillId: skillId1,
          targetLevel: ProficiencyLevel.INTERMEDIATE,
          isPrimary: true,
          skill: { code: 'PROG-001', name: 'Programming Basics' },
        },
      ]);
      // pathwaySkillRepo called with specific pathwayId
      pathwaySkillRepo.find.mockResolvedValue([
        { pathwayId, skillId: skillId1, requiredLevel: ProficiencyLevel.INTERMEDIATE, isCritical: false },
      ]);

      const result = await service.getCourseRecommendations(
        tenantId,
        studentProfileId,
        { pathwayId },
        adminUser,
      );

      // pathwaySkillRepo.find should be called (not pathwayRepo.find)
      expect(pathwaySkillRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ pathwayId }) }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].gapSkillsCovered).toBe(1);
    });
  });

  describe('getPathwayCourseRecommendations', () => {
    it('returns recommendations for specific pathway', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);
      pathwayRepo.findOne.mockResolvedValue({ id: pathwayId, title: 'Software Dev', tenantId });
      pathwaySkillRepo.find.mockResolvedValue([
        {
          pathwayId,
          skillId: skillId1,
          requiredLevel: ProficiencyLevel.ADVANCED,
          isCritical: true,
          skill: { code: 'PROG-001', name: 'Programming' },
        },
      ]);
      studentSkillRepo.find.mockResolvedValue([
        { skillId: skillId1, currentLevel: ProficiencyLevel.NOVICE },
      ]);
      masteryRepo.find.mockResolvedValue([]);
      courseRepo.find.mockResolvedValue([
        { id: courseId, code: 'CS-201', title: 'Advanced Programming', difficulty: 'advanced', learningTrack: 'STEM', status: CourseStatus.PUBLISHED },
      ]);
      courseSkillRepo.find.mockResolvedValue([
        {
          courseId,
          skillId: skillId1,
          targetLevel: ProficiencyLevel.ADVANCED,
          isPrimary: true,
          skill: { code: 'PROG-001', name: 'Programming' },
        },
      ]);

      const result = await service.getPathwayCourseRecommendations(tenantId, studentProfileId, pathwayId, adminUser);

      expect(result).toHaveLength(1);
      expect(result[0].courseId).toBe(courseId);
      expect(result[0].gapSkillsCovered).toBe(1);
    });

    it('throws NotFoundException for unknown pathway', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);
      pathwayRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getPathwayCourseRecommendations(tenantId, studentProfileId, pathwayId, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for unknown student', async () => {
      studentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getPathwayCourseRecommendations(tenantId, studentProfileId, pathwayId, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when student queries another student', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);

      await expect(
        service.getPathwayCourseRecommendations(tenantId, studentProfileId, pathwayId, otherStudentUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getSkillRecommendations', () => {
    it('returns prioritized skill list, critical skills ranked higher', async () => {
      studentRepo.findOne.mockResolvedValue(mockStudent);
      studentSkillRepo.find.mockResolvedValue([
        { skillId: skillId1, currentLevel: ProficiencyLevel.NOVICE },
        { skillId: skillId2, currentLevel: ProficiencyLevel.NOVICE },
      ]);
      masteryRepo.find.mockResolvedValue([]);
      pathwayRepo.find.mockResolvedValue([
        { id: pathwayId, title: 'Software Dev', isPublished: true },
      ]);
      pathwaySkillRepo.find.mockResolvedValue([
        {
          pathwayId,
          skillId: skillId1,
          requiredLevel: ProficiencyLevel.INTERMEDIATE,
          isCritical: true,
          skill: { code: 'PROG-001', name: 'Programming', type: 'technical' },
        },
        {
          pathwayId,
          skillId: skillId2,
          requiredLevel: ProficiencyLevel.BEGINNER,
          isCritical: false,
          skill: { code: 'COMM-001', name: 'Communication', type: 'soft' },
        },
      ]);

      const result = await service.getSkillRecommendations(tenantId, studentProfileId, adminUser);

      expect(result.length).toBeGreaterThanOrEqual(1);
      // Critical skill should rank higher
      const criticalSkill = result.find((r) => r.skillId === skillId1);
      const nonCriticalSkill = result.find((r) => r.skillId === skillId2);
      expect(criticalSkill).toBeDefined();
      expect(nonCriticalSkill).toBeDefined();
      expect(criticalSkill!.score).toBeGreaterThan(nonCriticalSkill!.score);
    });

    it('throws NotFoundException for unknown student', async () => {
      studentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getSkillRecommendations(tenantId, studentProfileId, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('deduplicates skills appearing in multiple pathways', async () => {
      const pathwayId2 = '00000000-0000-0000-0000-000000000099';

      studentRepo.findOne.mockResolvedValue(mockStudent);
      studentSkillRepo.find.mockResolvedValue([]);
      masteryRepo.find.mockResolvedValue([]);
      pathwayRepo.find.mockResolvedValue([
        { id: pathwayId, title: 'Software Dev', isPublished: true },
        { id: pathwayId2, title: 'Data Science', isPublished: true },
      ]);
      pathwaySkillRepo.find.mockResolvedValue([
        {
          pathwayId,
          skillId: skillId1,
          requiredLevel: ProficiencyLevel.INTERMEDIATE,
          isCritical: false,
          skill: { code: 'PROG-001', name: 'Programming', type: 'technical' },
        },
        {
          pathwayId: pathwayId2,
          skillId: skillId1,
          requiredLevel: ProficiencyLevel.ADVANCED,
          isCritical: true,
          skill: { code: 'PROG-001', name: 'Programming', type: 'technical' },
        },
      ]);

      const result = await service.getSkillRecommendations(tenantId, studentProfileId, adminUser);

      // skillId1 should appear only once
      const skillEntries = result.filter((r) => r.skillId === skillId1);
      expect(skillEntries).toHaveLength(1);
      // Should have 2 pathways
      expect(skillEntries[0].pathwayCount).toBe(2);
      // Should be marked critical (from pathway2)
      expect(skillEntries[0].isCritical).toBe(true);
    });
  });
});
