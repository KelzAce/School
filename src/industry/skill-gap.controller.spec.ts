import { Test, TestingModule } from '@nestjs/testing';
import { SkillGapController } from './skill-gap.controller.js';
import { SkillGapService } from './skill-gap.service.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';

const mockService = {
  getStudentOpportunityGap: jest.fn(),
  analyzeCustomTarget: jest.fn(),
  getStudentGapSummary: jest.fn(),
};

describe('SkillGapController', () => {
  let controller: SkillGapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillGapController],
      providers: [{ provide: SkillGapService, useValue: mockService }],
    }).compile();

    controller = module.get<SkillGapController>(SkillGapController);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-uuid';
  const studentProfileId = 'student-uuid';
  const opportunityId = 'opp-uuid';
  const requester = { id: 'user-uuid', role: 'admin' } as any;

  it('getStudentOpportunityGap - delegates to service', async () => {
    mockService.getStudentOpportunityGap.mockResolvedValue({ readinessPercent: 80 });

    const result = await controller.getStudentOpportunityGap(
      tenantId,
      studentProfileId,
      opportunityId,
      requester,
    );

    expect(mockService.getStudentOpportunityGap).toHaveBeenCalledWith(
      tenantId,
      studentProfileId,
      opportunityId,
      requester,
    );
    expect(result).toEqual({ readinessPercent: 80 });
  });

  it('analyzeCustomTarget - delegates to service', async () => {
    mockService.analyzeCustomTarget.mockResolvedValue({ readinessPercent: 60 });

    const result = await controller.analyzeCustomTarget(
      tenantId,
      studentProfileId,
      {
        targetName: 'Data Analyst Path',
        requiredSkillIds: ['00000000-0000-0000-0000-000000000001'],
        requiredLevel: ProficiencyLevel.INTERMEDIATE,
      },
      requester,
    );

    expect(mockService.analyzeCustomTarget).toHaveBeenCalled();
    expect(result).toEqual({ readinessPercent: 60 });
  });

  it('getStudentGapSummary - delegates to service', async () => {
    mockService.getStudentGapSummary.mockResolvedValue({
      opportunitiesAnalyzed: 2,
      averageReadinessPercent: 70,
    });

    const result = await controller.getStudentGapSummary(
      tenantId,
      studentProfileId,
      requester,
    );

    expect(mockService.getStudentGapSummary).toHaveBeenCalledWith(
      tenantId,
      studentProfileId,
      requester,
    );
    expect(result.averageReadinessPercent).toBe(70);
  });
});
