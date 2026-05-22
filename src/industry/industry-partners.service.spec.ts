import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { IndustryPartnersService } from './industry-partners.service.js';
import { IndustryPartner, PartnerSize } from './entities/industry-partner.entity.js';

const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('IndustryPartnersService', () => {
  let service: IndustryPartnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndustryPartnersService,
        { provide: getRepositoryToken(IndustryPartner), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<IndustryPartnersService>(IndustryPartnersService);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-uuid';
  const partnerId = 'partner-uuid';
  const mockPartner = { id: partnerId, tenantId, name: 'Acme Corp', slug: 'acme-corp', size: PartnerSize.MEDIUM };

  describe('create', () => {
    it('should create an industry partner', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(mockPartner);
      mockRepo.save.mockResolvedValue(mockPartner);
      const result = await service.create(tenantId, { name: 'Acme Corp', slug: 'acme-corp', industry: 'Technology', size: PartnerSize.MEDIUM });
      expect(result).toEqual(mockPartner);
    });

    it('should throw ConflictException if slug exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockPartner);
      await expect(service.create(tenantId, { name: 'Acme Corp', slug: 'acme-corp', industry: 'Technology', size: PartnerSize.MEDIUM }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated partners', async () => {
      mockRepo.findAndCount.mockResolvedValue([[mockPartner], 1]);
      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a partner', async () => {
      mockRepo.findOne.mockResolvedValue(mockPartner);
      const result = await service.findOne(tenantId, partnerId);
      expect(result).toEqual(mockPartner);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(tenantId, partnerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a partner', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockPartner });
      mockRepo.save.mockResolvedValue({ ...mockPartner, name: 'Updated' });
      const result = await service.update(tenantId, partnerId, { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('verify', () => {
    it('should verify a partner', async () => {
      const partner = { ...mockPartner, isVerified: false, verifiedAt: null };
      mockRepo.findOne.mockResolvedValue(partner);
      mockRepo.save.mockResolvedValue({ ...partner, isVerified: true, verifiedAt: new Date() });
      const result = await service.verify(tenantId, partnerId);
      expect(result.isVerified).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a partner', async () => {
      mockRepo.findOne.mockResolvedValue(mockPartner);
      mockRepo.remove.mockResolvedValue(undefined);
      await expect(service.remove(tenantId, partnerId)).resolves.toBeUndefined();
    });
  });
});
