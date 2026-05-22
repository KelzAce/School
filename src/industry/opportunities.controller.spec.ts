import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesController } from './opportunities.controller.js';
import { OpportunitiesService } from './opportunities.service.js';
import { OpportunityType, OpportunityStatus } from './entities/opportunity.entity.js';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPartner: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('OpportunitiesController', () => {
  let controller: OpportunitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [{ provide: OpportunitiesService, useValue: mockService }],
    }).compile();

    controller = module.get<OpportunitiesController>(OpportunitiesController);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-uuid';
  const id = 'opp-uuid';
  const partnerId = 'partner-uuid';
  const mockOpp = { id, tenantId, partnerId, title: 'Test Internship', type: OpportunityType.INTERNSHIP, status: OpportunityStatus.OPEN };

  it('create - calls service.create', async () => {
    mockService.create.mockResolvedValue(mockOpp);
    const result = await controller.create(tenantId, { partnerId, title: 'Test Internship', description: 'desc', type: OpportunityType.INTERNSHIP });
    expect(mockService.create).toHaveBeenCalledWith(tenantId, expect.any(Object));
    expect(result).toEqual(mockOpp);
  });

  it('findAll - calls service.findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [mockOpp], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } });
    const result = await controller.findAll(tenantId, { page: 1, limit: 20 });
    expect(mockService.findAll).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
  });

  it('findOne - calls service.findOne', async () => {
    mockService.findOne.mockResolvedValue(mockOpp);
    const result = await controller.findOne(tenantId, id);
    expect(mockService.findOne).toHaveBeenCalledWith(tenantId, id);
    expect(result).toEqual(mockOpp);
  });

  it('findByPartner - calls service.findByPartner', async () => {
    mockService.findByPartner.mockResolvedValue([mockOpp]);
    const result = await controller.findByPartner(tenantId, partnerId);
    expect(mockService.findByPartner).toHaveBeenCalledWith(tenantId, partnerId);
    expect(result).toHaveLength(1);
  });

  it('update - calls service.update', async () => {
    mockService.update.mockResolvedValue({ ...mockOpp, title: 'Updated' });
    const result = await controller.update(tenantId, id, { title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('remove - calls service.remove', async () => {
    mockService.remove.mockResolvedValue(undefined);
    await controller.remove(tenantId, id);
    expect(mockService.remove).toHaveBeenCalledWith(tenantId, id);
  });
});
