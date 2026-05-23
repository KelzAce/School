import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { WorkplacePlacementsService } from './workplace-placements.service.js';
import { WorkplacePlacement, PlacementStatus, PlacementType } from './entities/workplace-placement.entity.js';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid';
const id = 'placement-uuid';

describe('WorkplacePlacementsService', () => {
  let service: WorkplacePlacementsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkplacePlacementsService,
        { provide: getRepositoryToken(WorkplacePlacement), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(WorkplacePlacementsService);
    repo = module.get(getRepositoryToken(WorkplacePlacement));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a placement', async () => {
      const dto = {
        studentProfileId: 'student-uuid',
        partnerId: 'partner-uuid',
        partnerName: 'ACME Corp',
        title: 'Software Intern',
        type: PlacementType.INTERNSHIP,
        startDate: '2024-01-01',
      };
      const placement = { id, tenantId, ...dto };
      repo.create.mockReturnValue(placement);
      repo.save.mockResolvedValue(placement);

      const result = await service.create(tenantId, dto as any);
      expect(result).toEqual(placement);
      expect(repo.create).toHaveBeenCalledWith({ tenantId, ...dto });
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const placements = [{ id, tenantId }];
      repo.findAndCount.mockResolvedValue([placements, 1]);
      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toEqual(placements);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a placement', async () => {
      const placement = { id, tenantId };
      repo.findOne.mockResolvedValue(placement);
      const result = await service.findOne(tenantId, id);
      expect(result).toEqual(placement);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(tenantId, id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStudent', () => {
    it('should return placements for a student', async () => {
      const placements = [{ id, tenantId }];
      repo.find.mockResolvedValue(placements);
      const result = await service.findByStudent(tenantId, 'student-uuid');
      expect(result).toEqual(placements);
    });
  });

  describe('update', () => {
    it('should update a placement', async () => {
      const placement = { id, tenantId, title: 'Old Title' };
      repo.findOne.mockResolvedValue(placement);
      repo.save.mockResolvedValue({ ...placement, title: 'New Title' });
      const result = await service.update(tenantId, id, { title: 'New Title' } as any);
      expect(result.title).toBe('New Title');
    });
  });

  describe('complete', () => {
    it('should complete a placement', async () => {
      const placement = { id, tenantId, status: PlacementStatus.ACTIVE, completedAt: null };
      repo.findOne.mockResolvedValue(placement);
      repo.save.mockImplementation(async (p) => p);
      const result = await service.complete(tenantId, id);
      expect(result.status).toBe(PlacementStatus.COMPLETED);
      expect(result.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('should remove a placement', async () => {
      const placement = { id, tenantId };
      repo.findOne.mockResolvedValue(placement);
      repo.remove.mockResolvedValue(undefined);
      await expect(service.remove(tenantId, id)).resolves.toBeUndefined();
    });
  });
});
