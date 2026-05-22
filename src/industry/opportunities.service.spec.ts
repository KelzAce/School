import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service.js';
import { Opportunity, OpportunityType, OpportunityStatus } from './entities/opportunity.entity.js';

const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        { provide: getRepositoryToken(Opportunity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-uuid';
  const id = 'opp-uuid';
  const partnerId = 'partner-uuid';
  const mockOpp = { id, tenantId, partnerId, title: 'Test Internship', type: OpportunityType.INTERNSHIP, status: OpportunityStatus.OPEN };

  describe('create', () => {
    it('should create an opportunity', async () => {
      mockRepo.create.mockReturnValue(mockOpp);
      mockRepo.save.mockResolvedValue(mockOpp);
      const result = await service.create(tenantId, { partnerId, title: 'Test Internship', description: 'desc', type: OpportunityType.INTERNSHIP });
      expect(result).toEqual(mockOpp);
    });
  });

  describe('findAll', () => {
    it('should return paginated opportunities', async () => {
      mockRepo.findAndCount.mockResolvedValue([[mockOpp], 1]);
      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an opportunity', async () => {
      mockRepo.findOne.mockResolvedValue(mockOpp);
      const result = await service.findOne(tenantId, id);
      expect(result).toEqual(mockOpp);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(tenantId, id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPartner', () => {
    it('should return opportunities by partner', async () => {
      mockRepo.find.mockResolvedValue([mockOpp]);
      const result = await service.findByPartner(tenantId, partnerId);
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update an opportunity', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOpp });
      mockRepo.save.mockResolvedValue({ ...mockOpp, title: 'Updated' });
      const result = await service.update(tenantId, id, { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove an opportunity', async () => {
      mockRepo.findOne.mockResolvedValue(mockOpp);
      mockRepo.remove.mockResolvedValue(undefined);
      await expect(service.remove(tenantId, id)).resolves.toBeUndefined();
    });
  });
});
