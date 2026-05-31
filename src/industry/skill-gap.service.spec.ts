import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SkillGapService } from './skill-gap.service.js';
import { Opportunity, OpportunityStatus } from './entities/opportunity.entity.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';
import { UserRole } from '../users/entities/user.entity.js';

const createMockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('SkillGapService', () => {
  let service: SkillGapService;
  let opportunityRepo: ReturnType<typeof createMockRepo>;
  let studentRepo: ReturnType<typeof createMockRepo>;
  let studentSkillRepo: ReturnType<typeof createMockRepo>;
  let masteryRepo: ReturnType<typeof createMockRepo>;
  let skillRepo: ReturnType<typeof createMockRepo>;
  let courseSkillRepo: ReturnType<typeof createMockRepo>;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const studentProfileId = '00000000-0000-0000-0000-000000000101';
  const opportunityId = '00000000-0000-0000-0000-000000000201';
  const skillId = '00000000-0000-0000-0000-000000000301';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillGapService,
        { provide: getRepositoryToken(Opportunity), useValue: createMockRepo() },
        { provide: getRepositoryToken(StudentProfile), useValue: createMockRepo() },
        { provide: getRepositoryToken(StudentSkill), useValue: createMockRepo() },
        { provide: getRepositoryToken(MasteryRecord), useValue: createMockRepo() },
        { provide: getRepositoryToken(Skill), useValue: createMockRepo() },
        { provide: getRepositoryToken(CourseSkill), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<SkillGapService>(SkillGapService);
    opportunityRepo = module.get(getRepositoryToken(Opportunity));
    studentRepo = module.get(getRepositoryToken(StudentProfile));
    studentSkillRepo = module.get(getRepositoryToken(StudentSkill));
    masteryRepo = module.get(getRepositoryToken(MasteryRecord));
    skillRepo = module.get(getRepositoryToken(Skill));
    courseSkillRepo = module.get(getRepositoryToken(CourseSkill));

    jest.clearAllMocks();
  });

  it('computes opportunity skill gap with course recommendations', async () => {
    studentRepo.findOne.mockResolvedValue({
      id: studentProfileId,
      tenantId,
      userId: '00000000-0000-0000-0000-000000000111',
    });

    opportunityRepo.findOne.mockResolvedValue({
      id: opportunityId,
      tenantId,
      title: 'Cloud Internship',
      status: OpportunityStatus.OPEN,
      requiredSkillIds: [skillId],
      requiredLevel: ProficiencyLevel.INTERMEDIATE,
    });

    skillRepo.find.mockResolvedValue([
      { id: skillId, code: 'CLD-001', name: 'Cloud Fundamentals' },
    ]);
    studentSkillRepo.find.mockResolvedValue([
      { skillId, currentLevel: ProficiencyLevel.BEGINNER },
    ]);
    masteryRepo.find.mockResolvedValue([]);
    courseSkillRepo.find.mockResolvedValue([
      {
        skillId,
        courseId: '00000000-0000-0000-0000-000000000401',
        targetLevel: ProficiencyLevel.INTERMEDIATE,
        isPrimary: true,
        course: { code: 'CLOUD-201', title: 'Cloud Practitioner Lab' },
      },
    ]);

    const result = await service.getStudentOpportunityGap(
      tenantId,
      studentProfileId,
      opportunityId,
    );

    expect(result.targetType).toBe('opportunity');
    expect(result.requiredSkillsCount).toBe(1);
    expect(result.matchedSkillsCount).toBe(0);
    expect(result.underLeveledSkillsCount).toBe(1);
    expect(result.missingSkillsCount).toBe(0);
    expect(result.underLeveledSkills[0].recommendations).toHaveLength(1);
    expect(result.recommendedCourseIds).toEqual([
      '00000000-0000-0000-0000-000000000401',
    ]);
  });

  it('throws not found when opportunity does not exist', async () => {
    studentRepo.findOne.mockResolvedValue({ id: studentProfileId, tenantId, userId: 'u1' });
    opportunityRepo.findOne.mockResolvedValue(null);

    await expect(
      service.getStudentOpportunityGap(tenantId, studentProfileId, opportunityId),
    ).rejects.toThrow(NotFoundException);
  });

  it('blocks students from viewing another student profile', async () => {
    studentRepo.findOne.mockResolvedValue({
      id: studentProfileId,
      tenantId,
      userId: '00000000-0000-0000-0000-000000000111',
    });

    await expect(
      service.getStudentGapSummary(tenantId, studentProfileId, {
        id: '00000000-0000-0000-0000-000000000999',
        role: UserRole.STUDENT,
      } as any),
    ).rejects.toThrow(ForbiddenException);
  });
});
