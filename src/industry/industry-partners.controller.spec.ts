import { Test, TestingModule } from '@nestjs/testing';
import { IndustryPartnersController } from './industry-partners.controller.js';
import { IndustryPartnersService } from './industry-partners.service.js';
import { PartnerSize } from './entities/industry-partner.entity.js';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findBySlug: jest.fn(),
  update: jest.fn(),
  verify: jest.fn(),
  remove: jest.fn(),
};

describe('IndustryPartnersController', () => {
  let controller: IndustryPartnersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndustryPartnersController],
      providers: [{ provide: IndustryPartnersService, useValue: mockService }],
    }).compile();

    controller = module.get<IndustryPartnersController>(IndustryPartnersController);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-uuid';
  const partnerId = 'partner-uuid';
  const mockPartner = { id: partnerId, tenantId, name: 'Acme Corp', slug: 'acme-corp', size: PartnerSize.MEDIUM };

  it('create - calls service.create', async () => {
    mockService.create.mockResolvedValue(mockPartner);
    const result = await controller.create(tenantId, { name: 'Acme Corp', slug: 'acme-corp', industry: 'Technology', size: PartnerSize.MEDIUM });
    expect(mockService.create).toHaveBeenCalledWith(tenantId, expect.any(Object));
    expect(result).toEqual(mockPartner);
  });

  it('findAll - calls service.findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [mockPartner], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } });
    const result = await controller.findAll(tenantId, { page: 1, limit: 20 });
    expect(mockService.findAll).toHaveBeenCalledWith(tenantId, expect.any(Object));
    expect(result.data).toHaveLength(1);
  });

  it('findOne - calls service.findOne', async () => {
    mockService.findOne.mockResolvedValue(mockPartner);
    const result = await controller.findOne(tenantId, partnerId);
    expect(mockService.findOne).toHaveBeenCalledWith(tenantId, partnerId);
    expect(result).toEqual(mockPartner);
  });

  it('update - calls service.update', async () => {
    mockService.update.mockResolvedValue({ ...mockPartner, name: 'Updated' });
    const result = await controller.update(tenantId, partnerId, { name: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith(tenantId, partnerId, expect.any(Object));
    expect(result.name).toBe('Updated');
  });

  it('verify - calls service.verify', async () => {
    mockService.verify.mockResolvedValue({ ...mockPartner, isVerified: true });
    const result = await controller.verify(tenantId, partnerId);
    expect(mockService.verify).toHaveBeenCalledWith(tenantId, partnerId);
    expect(result.isVerified).toBe(true);
  });

  it('remove - calls service.remove', async () => {
    mockService.remove.mockResolvedValue(undefined);
    await controller.remove(tenantId, partnerId);
    expect(mockService.remove).toHaveBeenCalledWith(tenantId, partnerId);
  });
});
