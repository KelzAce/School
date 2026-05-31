import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller.js';
import { RecommendationsService } from './recommendations.service.js';
import { UserRole } from '../users/entities/user.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';

const mockService = {
  getCourseRecommendations: jest.fn(),
  getPathwayCourseRecommendations: jest.fn(),
  getSkillRecommendations: jest.fn(),
};

describe('RecommendationsController', () => {
  let controller: RecommendationsController;

  const tenantId = 'tenant-uuid';
  const studentProfileId = '00000000-0000-0000-0000-000000000001';
  const pathwayId = '00000000-0000-0000-0000-000000000002';
  const requester = { id: 'admin-id', role: UserRole.ADMIN } as any;

  const mockCourseRec = {
    courseId: '00000000-0000-0000-0000-000000000003',
    courseCode: 'CS-101',
    courseTitle: 'Intro to Programming',
    difficulty: 'beginner',
    learningTrack: 'STEM',
    score: 15,
    gapSkillsCovered: 2,
    criticalSkillsCovered: 1,
    totalSkillsTaught: 3,
    reasons: ['Covers 2 of your skill gaps'],
    skills: [],
  };

  const mockSkillRec = {
    skillId: '00000000-0000-0000-0000-000000000004',
    skillCode: 'PROG-001',
    skillName: 'Programming',
    skillType: 'technical',
    currentLevel: ProficiencyLevel.NOVICE,
    targetLevel: ProficiencyLevel.INTERMEDIATE,
    gapLevels: 2,
    isCritical: true,
    pathwayCount: 2,
    score: 35,
    pathways: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [{ provide: RecommendationsService, useValue: mockService }],
    }).compile();

    controller = module.get<RecommendationsController>(RecommendationsController);
    jest.clearAllMocks();
  });

  it('getCourseRecommendations - delegates to service', async () => {
    mockService.getCourseRecommendations.mockResolvedValue([mockCourseRec]);

    const result = await controller.getCourseRecommendations(tenantId, studentProfileId, {}, requester);

    expect(mockService.getCourseRecommendations).toHaveBeenCalledWith(tenantId, studentProfileId, {}, requester);
    expect(result).toHaveLength(1);
    expect(result[0].courseId).toBe(mockCourseRec.courseId);
  });

  it('getPathwayCourseRecommendations - delegates to service', async () => {
    mockService.getPathwayCourseRecommendations.mockResolvedValue([mockCourseRec]);

    const result = await controller.getPathwayCourseRecommendations(tenantId, studentProfileId, pathwayId, requester);

    expect(mockService.getPathwayCourseRecommendations).toHaveBeenCalledWith(tenantId, studentProfileId, pathwayId, requester);
    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(15);
  });

  it('getSkillRecommendations - delegates to service', async () => {
    mockService.getSkillRecommendations.mockResolvedValue([mockSkillRec]);

    const result = await controller.getSkillRecommendations(tenantId, studentProfileId, requester);

    expect(mockService.getSkillRecommendations).toHaveBeenCalledWith(tenantId, studentProfileId, requester);
    expect(result).toHaveLength(1);
    expect(result[0].skillId).toBe(mockSkillRec.skillId);
    expect(result[0].isCritical).toBe(true);
  });

  it('getCourseRecommendations - returns empty array when no recommendations', async () => {
    mockService.getCourseRecommendations.mockResolvedValue([]);

    const result = await controller.getCourseRecommendations(tenantId, studentProfileId, { limit: 5 }, requester);

    expect(mockService.getCourseRecommendations).toHaveBeenCalledWith(tenantId, studentProfileId, { limit: 5 }, requester);
    expect(result).toEqual([]);
  });
});
