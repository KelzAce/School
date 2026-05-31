import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsGranularity } from './dto/analytics-query.dto.js';

const mockService = {
  getOverview: jest.fn(),
  getEnrollmentTrends: jest.fn(),
  getCompletionRates: jest.fn(),
  getSkillVelocity: jest.fn(),
  getProgramStats: jest.fn(),
};

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const programId = '00000000-0000-0000-0000-000000000010';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockService }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    jest.clearAllMocks();
  });

  it('getOverview - delegates to service', async () => {
    const mockResult = {
      totalStudents: 50,
      activeEnrollments: 20,
      completedEnrollments: 10,
      totalPrograms: 5,
      totalCourses: 15,
      overallCompletionRate: 33,
      topSkills: [],
    };
    mockService.getOverview.mockResolvedValue(mockResult);

    const result = await controller.getOverview(tenantId);

    expect(mockService.getOverview).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(mockResult);
  });

  it('getEnrollmentTrends - delegates to service with query', async () => {
    const query = { granularity: AnalyticsGranularity.MONTH, from: '2025-01-01', to: '2025-03-01' };
    const mockResult = {
      granularity: AnalyticsGranularity.MONTH,
      from: '2025-01-01T00:00:00.000Z',
      to: '2025-03-01T00:00:00.000Z',
      data: [{ period: '2025-01', total: 5, pending: 1, active: 2, completed: 2, withdrawn: 0 }],
    };
    mockService.getEnrollmentTrends.mockResolvedValue(mockResult);

    const result = await controller.getEnrollmentTrends(tenantId, query);

    expect(mockService.getEnrollmentTrends).toHaveBeenCalledWith(tenantId, query);
    expect(result).toEqual(mockResult);
  });

  it('getCompletionRates - delegates to service', async () => {
    const mockResult = {
      overall: { enrolled: 10, completed: 4, rate: 40 },
      byProgram: [],
    };
    mockService.getCompletionRates.mockResolvedValue(mockResult);

    const result = await controller.getCompletionRates(tenantId);

    expect(mockService.getCompletionRates).toHaveBeenCalledWith(tenantId);
    expect(result).toEqual(mockResult);
  });

  it('getSkillVelocity - delegates to service with query', async () => {
    const query = { granularity: AnalyticsGranularity.WEEK };
    const mockResult = {
      granularity: AnalyticsGranularity.WEEK,
      from: '2024-01-01T00:00:00.000Z',
      to: '2025-01-01T00:00:00.000Z',
      data: [{ period: '2024-W01', masteryCount: 3 }],
      totalMasteries: 3,
    };
    mockService.getSkillVelocity.mockResolvedValue(mockResult);

    const result = await controller.getSkillVelocity(tenantId, query);

    expect(mockService.getSkillVelocity).toHaveBeenCalledWith(tenantId, query);
    expect(result).toEqual(mockResult);
  });

  it('getProgramStats - delegates to service with programId', async () => {
    const mockResult = {
      programId,
      programName: 'Full Stack',
      totalEnrolled: 10,
      pending: 2,
      active: 5,
      completed: 2,
      withdrawn: 1,
      completionRate: 20,
      cohortCount: 3,
    };
    mockService.getProgramStats.mockResolvedValue(mockResult);

    const result = await controller.getProgramStats(tenantId, programId);

    expect(mockService.getProgramStats).toHaveBeenCalledWith(tenantId, programId);
    expect(result).toEqual(mockResult);
  });
});
