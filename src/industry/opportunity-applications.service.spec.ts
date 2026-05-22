import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { OpportunityApplicationsService } from './opportunity-applications.service.js';
import { OpportunityApplication, ApplicationStatus } from './entities/opportunity-application.entity.js';

const mockRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('OpportunityApplicationsService', () => {
  let service: OpportunityApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunityApplicationsService,
        { provide: getRepositoryToken(OpportunityApplication), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<OpportunityApplicationsService>(OpportunityApplicationsService);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-uuid';
  const id = 'app-uuid';
  const opportunityId = 'opp-uuid';
  const studentProfileId = 'student-uuid';
  const mockApp = { id, tenantId, opportunityId, studentProfileId, status: ApplicationStatus.PENDING };

  describe('create', () => {
    it('should create an application', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(mockApp);
      mockRepo.save.mockResolvedValue(mockApp);
      const result = await service.create(tenantId, { opportunityId, studentProfileId });
      expect(result).toEqual(mockApp);
    });

    it('should throw ConflictException if already applied', async () => {
      mockRepo.findOne.mockResolvedValue(mockApp);
      await expect(service.create(tenantId, { opportunityId, studentProfileId }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findByOpportunity', () => {
    it('should return applications for an opportunity', async () => {
      mockRepo.find.mockResolvedValue([mockApp]);
      const result = await service.findByOpportunity(tenantId, opportunityId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findByStudent', () => {
    it('should return applications by student', async () => {
      mockRepo.find.mockResolvedValue([mockApp]);
      const result = await service.findByStudent(tenantId, studentProfileId);
      expect(result).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should update application status', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockApp });
      mockRepo.save.mockResolvedValue({ ...mockApp, status: ApplicationStatus.SHORTLISTED });
      const result = await service.updateStatus(tenantId, id, { status: ApplicationStatus.SHORTLISTED });
      expect(result.status).toBe(ApplicationStatus.SHORTLISTED);
    });
  });

  describe('withdraw', () => {
    it('should withdraw an application', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockApp });
      mockRepo.save.mockResolvedValue({ ...mockApp, status: ApplicationStatus.WITHDRAWN });
      const result = await service.withdraw(tenantId, id);
      expect(result.status).toBe(ApplicationStatus.WITHDRAWN);
    });
  });
});
