import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityApplicationsController } from './opportunity-applications.controller.js';
import { OpportunityApplicationsService } from './opportunity-applications.service.js';
import { ApplicationStatus } from './entities/opportunity-application.entity.js';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByOpportunity: jest.fn(),
  findByStudent: jest.fn(),
  updateStatus: jest.fn(),
  withdraw: jest.fn(),
};

describe('OpportunityApplicationsController', () => {
  let controller: OpportunityApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunityApplicationsController],
      providers: [{ provide: OpportunityApplicationsService, useValue: mockService }],
    }).compile();

    controller = module.get<OpportunityApplicationsController>(OpportunityApplicationsController);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-uuid';
  const id = 'app-uuid';
  const opportunityId = 'opp-uuid';
  const studentProfileId = 'student-uuid';
  const mockApp = { id, tenantId, opportunityId, studentProfileId, status: ApplicationStatus.PENDING };

  it('create - calls service.create', async () => {
    mockService.create.mockResolvedValue(mockApp);
    const result = await controller.create(tenantId, { opportunityId, studentProfileId });
    expect(mockService.create).toHaveBeenCalledWith(tenantId, expect.any(Object));
    expect(result).toEqual(mockApp);
  });

  it('findByOpportunity - calls service.findByOpportunity', async () => {
    mockService.findByOpportunity.mockResolvedValue([mockApp]);
    const result = await controller.findByOpportunity(tenantId, opportunityId);
    expect(mockService.findByOpportunity).toHaveBeenCalledWith(tenantId, opportunityId);
    expect(result).toHaveLength(1);
  });

  it('findByStudent - calls service.findByStudent', async () => {
    mockService.findByStudent.mockResolvedValue([mockApp]);
    const result = await controller.findByStudent(tenantId, studentProfileId);
    expect(mockService.findByStudent).toHaveBeenCalledWith(tenantId, studentProfileId);
    expect(result).toHaveLength(1);
  });

  it('updateStatus - calls service.updateStatus', async () => {
    mockService.updateStatus.mockResolvedValue({ ...mockApp, status: ApplicationStatus.ACCEPTED });
    const result = await controller.updateStatus(tenantId, id, { status: ApplicationStatus.ACCEPTED });
    expect(mockService.updateStatus).toHaveBeenCalledWith(tenantId, id, expect.any(Object));
    expect(result.status).toBe(ApplicationStatus.ACCEPTED);
  });

  it('withdraw - calls service.withdraw', async () => {
    mockService.withdraw.mockResolvedValue({ ...mockApp, status: ApplicationStatus.WITHDRAWN });
    const result = await controller.withdraw(tenantId, id);
    expect(mockService.withdraw).toHaveBeenCalledWith(tenantId, id);
    expect(result.status).toBe(ApplicationStatus.WITHDRAWN);
  });
});
