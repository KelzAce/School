import { Test, TestingModule } from '@nestjs/testing';
import { OutcomesController } from './outcomes.controller.js';
import { OutcomesService } from './outcomes.service.js';

const mockService = {
  getOverview: jest.fn(),
  getGraduateReport: jest.fn(),
  getEmploymentReport: jest.fn(),
  getCredentialReport: jest.fn(),
};

const tenantId = '00000000-0000-0000-0000-000000000001';

describe('OutcomesController', () => {
  let controller: OutcomesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OutcomesController],
      providers: [{ provide: OutcomesService, useValue: mockService }],
    }).compile();

    controller = module.get<OutcomesController>(OutcomesController);
    jest.clearAllMocks();
  });

  it('GET /outcomes/overview — delegates to service.getOverview', async () => {
    const expected = { totalStudents: 10, graduates: 5, graduationRate: 50, computedAt: new Date().toISOString() };
    mockService.getOverview.mockResolvedValue(expected);

    const result = await controller.getOverview(tenantId, {});

    expect(mockService.getOverview).toHaveBeenCalledWith(tenantId, {});
    expect(result).toBe(expected);
  });

  it('GET /outcomes/graduates — delegates to service.getGraduateReport', async () => {
    const expected = { totalGraduates: 3, byLearningTrack: {}, byMonth: [], completionsByProgram: [], computedAt: new Date().toISOString() };
    mockService.getGraduateReport.mockResolvedValue(expected);

    const result = await controller.getGraduateReport(tenantId, {});

    expect(mockService.getGraduateReport).toHaveBeenCalledWith(tenantId, {});
    expect(result).toBe(expected);
  });

  it('GET /outcomes/employment — delegates to service.getEmploymentReport', async () => {
    const expected = {
      totalAccepted: 2,
      totalShortlisted: 1,
      applicationsByStatus: {},
      completedPlacements: 3,
      activePlacements: 1,
      terminatedPlacements: 0,
      placementsByType: {},
      employmentRate: 50,
      computedAt: new Date().toISOString(),
    };
    mockService.getEmploymentReport.mockResolvedValue(expected);

    const result = await controller.getEmploymentReport(tenantId, {});

    expect(mockService.getEmploymentReport).toHaveBeenCalledWith(tenantId, {});
    expect(result).toBe(expected);
  });

  it('GET /outcomes/credentials — delegates to service.getCredentialReport', async () => {
    const expected = {
      totalIssuedBadges: 5,
      revokedBadges: 1,
      activeMicroCredentials: 3,
      revokedMicroCredentials: 0,
      badgesIssuedByMonth: [],
      credentialsIssuedByMonth: [],
      studentsWithCredentials: 4,
      studentsWithJobAfterCredential: 2,
      credentialToJobConversionRate: 50,
      computedAt: new Date().toISOString(),
    };
    mockService.getCredentialReport.mockResolvedValue(expected);

    const result = await controller.getCredentialReport(tenantId, {});

    expect(mockService.getCredentialReport).toHaveBeenCalledWith(tenantId, {});
    expect(result).toBe(expected);
  });
});
