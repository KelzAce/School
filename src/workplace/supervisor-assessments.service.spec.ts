import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SupervisorAssessmentsService } from './supervisor-assessments.service.js';
import { SupervisorAssessment, SupervisorRating } from './entities/supervisor-assessment.entity.js';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid';
const id = 'assessment-uuid';

describe('SupervisorAssessmentsService', () => {
  let service: SupervisorAssessmentsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupervisorAssessmentsService,
        { provide: getRepositoryToken(SupervisorAssessment), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(SupervisorAssessmentsService);
    repo = module.get(getRepositoryToken(SupervisorAssessment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an assessment', async () => {
      const dto = {
        placementId: 'placement-uuid',
        studentProfileId: 'student-uuid',
        assessmentPeriod: 'Week 1-4',
        assessedBy: 'John Doe',
        overallRating: SupervisorRating.GOOD,
        technicalSkillsRating: SupervisorRating.GOOD,
        communicationRating: SupervisorRating.SATISFACTORY,
        teamworkRating: SupervisorRating.GOOD,
        initiativeRating: SupervisorRating.SATISFACTORY,
        reliabilityRating: SupervisorRating.EXCELLENT,
      };
      const assessment = { id, tenantId, ...dto };
      repo.create.mockReturnValue(assessment);
      repo.save.mockResolvedValue(assessment);
      const result = await service.create(tenantId, dto as any);
      expect(result).toEqual(assessment);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      repo.findAndCount.mockResolvedValue([[{ id }], 1]);
      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an assessment', async () => {
      repo.findOne.mockResolvedValue({ id, tenantId });
      const result = await service.findOne(tenantId, id);
      expect(result.id).toBe(id);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(tenantId, id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPlacement', () => {
    it('should return assessments for a placement', async () => {
      repo.find.mockResolvedValue([{ id }]);
      const result = await service.findByPlacement(tenantId, 'placement-uuid');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByStudent', () => {
    it('should return assessments for a student', async () => {
      repo.find.mockResolvedValue([{ id }]);
      const result = await service.findByStudent(tenantId, 'student-uuid');
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update an assessment', async () => {
      const assessment = { id, tenantId, assessmentPeriod: 'Old' };
      repo.findOne.mockResolvedValue(assessment);
      repo.save.mockResolvedValue({ ...assessment, assessmentPeriod: 'New' });
      const result = await service.update(tenantId, id, { assessmentPeriod: 'New' } as any);
      expect(result.assessmentPeriod).toBe('New');
    });
  });

  describe('remove', () => {
    it('should remove an assessment', async () => {
      repo.findOne.mockResolvedValue({ id, tenantId });
      repo.remove.mockResolvedValue(undefined);
      await expect(service.remove(tenantId, id)).resolves.toBeUndefined();
    });
  });
});
