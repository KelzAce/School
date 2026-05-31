import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CareerPathwaysService } from './career-pathways.service.js';
import { CareerPathway } from './entities/career-pathway.entity.js';
import { CareerPathwaySkill } from './entities/career-pathway-skill.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';
import { UserRole } from '../users/entities/user.entity.js';

const createMockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('CareerPathwaysService', () => {
  let service: CareerPathwaysService;
  let pathwayRepo: ReturnType<typeof createMockRepo>;
  let pathwaySkillRepo: ReturnType<typeof createMockRepo>;
  let skillRepo: ReturnType<typeof createMockRepo>;
  let studentRepo: ReturnType<typeof createMockRepo>;
  let studentSkillRepo: ReturnType<typeof createMockRepo>;
  let masteryRepo: ReturnType<typeof createMockRepo>;
  let courseSkillRepo: ReturnType<typeof createMockRepo>;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const pathwayId = '00000000-0000-0000-0000-000000000002';
  const studentProfileId = '00000000-0000-0000-0000-000000000003';
  const skillId = '00000000-0000-0000-0000-000000000004';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareerPathwaysService,
        { provide: getRepositoryToken(CareerPathway), useValue: createMockRepo() },
        { provide: getRepositoryToken(CareerPathwaySkill), useValue: createMockRepo() },
        { provide: getRepositoryToken(Skill), useValue: createMockRepo() },
        { provide: getRepositoryToken(StudentProfile), useValue: createMockRepo() },
        { provide: getRepositoryToken(StudentSkill), useValue: createMockRepo() },
        { provide: getRepositoryToken(MasteryRecord), useValue: createMockRepo() },
        { provide: getRepositoryToken(CourseSkill), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<CareerPathwaysService>(CareerPathwaysService);
    pathwayRepo = module.get(getRepositoryToken(CareerPathway));
    pathwaySkillRepo = module.get(getRepositoryToken(CareerPathwaySkill));
    skillRepo = module.get(getRepositoryToken(Skill));
    studentRepo = module.get(getRepositoryToken(StudentProfile));
    studentSkillRepo = module.get(getRepositoryToken(StudentSkill));
    masteryRepo = module.get(getRepositoryToken(MasteryRecord));
    courseSkillRepo = module.get(getRepositoryToken(CourseSkill));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a pathway successfully', async () => {
      pathwayRepo.findOne.mockResolvedValue(null);
      pathwayRepo.create.mockReturnValue({ tenantId, title: 'Data Engineer', slug: 'data-engineer' });
      pathwayRepo.save.mockResolvedValue({ id: pathwayId, tenantId, title: 'Data Engineer', slug: 'data-engineer' });

      const result = await service.create(tenantId, { title: 'Data Engineer', slug: 'data-engineer' });
      expect(result.id).toBe(pathwayId);
    });

    it('throws ConflictException when slug already exists', async () => {
      pathwayRepo.findOne.mockResolvedValue({ id: pathwayId });

      await expect(
        service.create(tenantId, { title: 'Data Engineer', slug: 'data-engineer' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns a pathway with skills', async () => {
      pathwayRepo.findOne.mockResolvedValue({ id: pathwayId, title: 'Data Engineer', pathwaySkills: [] });

      const result = await service.findOne(tenantId, pathwayId);
      expect(result.id).toBe(pathwayId);
    });

    it('throws NotFoundException when pathway not found', async () => {
      pathwayRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(tenantId, pathwayId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates a pathway', async () => {
      const pathway = { id: pathwayId, title: 'Old Title', slug: 'old-slug', save: jest.fn() };
      pathwayRepo.findOne.mockResolvedValue(pathway);
      pathwayRepo.save.mockResolvedValue({ ...pathway, title: 'New Title' });

      const result = await service.update(tenantId, pathwayId, { title: 'New Title' });
      expect(result.title).toBe('New Title');
    });

    it('throws NotFoundException for missing pathway', async () => {
      pathwayRepo.findOne.mockResolvedValue(null);

      await expect(service.update(tenantId, pathwayId, { title: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('addSkill', () => {
    it('adds a skill to a pathway', async () => {
      pathwayRepo.findOne.mockResolvedValue({ id: pathwayId });
      skillRepo.findOne.mockResolvedValue({ id: skillId });
      pathwaySkillRepo.findOne.mockResolvedValue(null);
      pathwaySkillRepo.create.mockReturnValue({ pathwayId, skillId });
      pathwaySkillRepo.save.mockResolvedValue({ id: 'ps-id', pathwayId, skillId });

      const result = await service.addSkill(tenantId, pathwayId, {
        skillId,
        requiredLevel: ProficiencyLevel.INTERMEDIATE,
      });
      expect(result.pathwayId).toBe(pathwayId);
    });

    it('throws NotFoundException when pathway not found', async () => {
      pathwayRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addSkill(tenantId, pathwayId, { skillId, requiredLevel: ProficiencyLevel.BEGINNER }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when skill already mapped', async () => {
      pathwayRepo.findOne.mockResolvedValue({ id: pathwayId });
      skillRepo.findOne.mockResolvedValue({ id: skillId });
      pathwaySkillRepo.findOne.mockResolvedValue({ id: 'existing-ps' });

      await expect(
        service.addSkill(tenantId, pathwayId, { skillId, requiredLevel: ProficiencyLevel.INTERMEDIATE }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getSkillTree', () => {
    it('returns a flat tree when no parent-child relationships in pathway', async () => {
      pathwayRepo.findOne.mockResolvedValue({ id: pathwayId });
      pathwaySkillRepo.find.mockResolvedValue([
        {
          skillId,
          requiredLevel: ProficiencyLevel.INTERMEDIATE,
          isCritical: true,
          sortOrder: 0,
          skill: { code: 'DS-001', name: 'Data Science', type: 'technical', parentId: null },
        },
      ]);

      const result = await service.getSkillTree(tenantId, pathwayId);
      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(0);
    });

    it('throws NotFoundException when pathway not found', async () => {
      pathwayRepo.findOne.mockResolvedValue(null);

      await expect(service.getSkillTree(tenantId, pathwayId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudentProgress', () => {
    it('returns student progress on a pathway', async () => {
      studentRepo.findOne.mockResolvedValue({
        id: studentProfileId,
        tenantId,
        userId: '00000000-0000-0000-0000-000000000999',
      });
      pathwayRepo.findOne.mockResolvedValue({ id: pathwayId, title: 'Data Engineer' });
      pathwaySkillRepo.find.mockResolvedValue([
        {
          skillId,
          requiredLevel: ProficiencyLevel.INTERMEDIATE,
          isCritical: true,
          sortOrder: 0,
          skill: { code: 'DS-001', name: 'Data Science' },
        },
      ]);
      studentSkillRepo.find.mockResolvedValue([{ skillId, currentLevel: ProficiencyLevel.BEGINNER }]);
      masteryRepo.find.mockResolvedValue([]);
      courseSkillRepo.find.mockResolvedValue([]);

      const result = await service.getStudentProgress(tenantId, studentProfileId, pathwayId);

      expect(result.pathwayId).toBe(pathwayId);
      expect(result.totalSkillsCount).toBe(1);
      expect(result.masteredSkillsCount).toBe(0);
      expect(result.inProgressSkillsCount).toBe(1);
      expect(result.skills[0].status).toBe('in_progress');
    });

    it('throws ForbiddenException when student views another student', async () => {
      studentRepo.findOne.mockResolvedValue({
        id: studentProfileId,
        tenantId,
        userId: '00000000-0000-0000-0000-000000000111',
      });

      await expect(
        service.getStudentProgress(tenantId, studentProfileId, pathwayId, {
          id: '00000000-0000-0000-0000-000000000999',
          role: UserRole.STUDENT,
        } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when student not found', async () => {
      studentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getStudentProgress(tenantId, studentProfileId, pathwayId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudentSuggestions', () => {
    it('returns suggested pathways sorted by completion percent', async () => {
      studentRepo.findOne.mockResolvedValue({
        id: studentProfileId,
        tenantId,
        userId: '00000000-0000-0000-0000-000000000999',
      });
      pathwayRepo.find.mockResolvedValue([
        { id: pathwayId, title: 'Data Engineer', sector: 'Tech' },
      ]);
      studentSkillRepo.find.mockResolvedValue([
        { skillId, currentLevel: ProficiencyLevel.ADVANCED },
      ]);
      masteryRepo.find.mockResolvedValue([]);
      pathwaySkillRepo.find.mockResolvedValue([
        { pathwayId, skillId, requiredLevel: ProficiencyLevel.INTERMEDIATE },
      ]);

      const result = await service.getStudentSuggestions(tenantId, studentProfileId);
      expect(result).toHaveLength(1);
      expect(result[0].completionPercent).toBe(100);
    });

    it('returns empty array when no published pathways', async () => {
      studentRepo.findOne.mockResolvedValue({
        id: studentProfileId,
        tenantId,
        userId: '00000000-0000-0000-0000-000000000999',
      });
      pathwayRepo.find.mockResolvedValue([]);
      studentSkillRepo.find.mockResolvedValue([]);
      masteryRepo.find.mockResolvedValue([]);

      const result = await service.getStudentSuggestions(tenantId, studentProfileId);
      expect(result).toEqual([]);
    });
  });
});
