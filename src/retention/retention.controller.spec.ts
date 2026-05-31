import { Test, TestingModule } from '@nestjs/testing';
import { RetentionController } from './retention.controller.js';
import { RetentionService } from './retention.service.js';
import { RiskLevel } from './dto/index.js';

const mockService = {
  getSummary: jest.fn(),
  getAlerts: jest.fn(),
  getStudentAlert: jest.fn(),
};

describe('RetentionController', () => {
  let controller: RetentionController;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const studentProfileId = '00000000-0000-0000-0000-000000000002';

  const mockAlert = {
    studentProfileId,
    studentNumber: 'S-001',
    userId: '00000000-0000-0000-0000-000000000003',
    riskScore: 45,
    riskLevel: RiskLevel.MEDIUM,
    riskFactors: [
      { signal: 'NO_RECENT_MASTERY', description: 'No skills mastered in the last 30 days', points: 25 },
    ],
    recommendations: ['Schedule a 1-on-1 check-in to review skill progression'],
    computedAt: new Date().toISOString(),
  };

  const mockSummary = {
    totalActiveStudents: 10,
    none: 3,
    low: 2,
    medium: 3,
    high: 1,
    critical: 1,
    computedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetentionController],
      providers: [{ provide: RetentionService, useValue: mockService }],
    }).compile();

    controller = module.get<RetentionController>(RetentionController);
    jest.clearAllMocks();
  });

  it('getSummary - delegates to service and returns summary', async () => {
    mockService.getSummary.mockResolvedValue(mockSummary);

    const result = await controller.getSummary(tenantId);

    expect(mockService.getSummary).toHaveBeenCalledWith(tenantId);
    expect(result.totalActiveStudents).toBe(10);
    expect(result.medium).toBe(3);
  });

  it('getAlerts - delegates to service with query', async () => {
    mockService.getAlerts.mockResolvedValue([mockAlert]);
    const query = { minRiskLevel: RiskLevel.MEDIUM, limit: 20 };

    const result = await controller.getAlerts(tenantId, query);

    expect(mockService.getAlerts).toHaveBeenCalledWith(tenantId, query);
    expect(result).toHaveLength(1);
    expect(result[0].riskLevel).toBe(RiskLevel.MEDIUM);
  });

  it('getAlerts - returns empty array when no at-risk students', async () => {
    mockService.getAlerts.mockResolvedValue([]);

    const result = await controller.getAlerts(tenantId, {});

    expect(result).toEqual([]);
  });

  it('getStudentAlert - delegates to service with studentProfileId', async () => {
    mockService.getStudentAlert.mockResolvedValue(mockAlert);

    const result = await controller.getStudentAlert(tenantId, studentProfileId);

    expect(mockService.getStudentAlert).toHaveBeenCalledWith(tenantId, studentProfileId);
    expect(result.studentProfileId).toBe(studentProfileId);
    expect(result.riskScore).toBe(45);
  });

  it('getStudentAlert - returns alert with risk factors and recommendations', async () => {
    mockService.getStudentAlert.mockResolvedValue(mockAlert);

    const result = await controller.getStudentAlert(tenantId, studentProfileId);

    expect(result.riskFactors).toHaveLength(1);
    expect(result.riskFactors[0].signal).toBe('NO_RECENT_MASTERY');
    expect(result.recommendations).toContain('Schedule a 1-on-1 check-in to review skill progression');
  });
});
