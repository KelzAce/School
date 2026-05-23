import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { WorkplaceLogsService } from './workplace-logs.service.js';
import { WorkplaceLog, LogStatus } from './entities/workplace-log.entity.js';
import { WorkplacePlacement } from './entities/workplace-placement.entity.js';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid';
const id = 'log-uuid';

describe('WorkplaceLogsService', () => {
  let service: WorkplaceLogsService;
  let logRepo: ReturnType<typeof mockRepo>;
  let placementRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkplaceLogsService,
        { provide: getRepositoryToken(WorkplaceLog), useFactory: mockRepo },
        { provide: getRepositoryToken(WorkplacePlacement), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(WorkplaceLogsService);
    logRepo = module.get(getRepositoryToken(WorkplaceLog));
    placementRepo = module.get(getRepositoryToken(WorkplacePlacement));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a log and update placement hours', async () => {
      const dto = {
        placementId: 'placement-uuid',
        studentProfileId: 'student-uuid',
        logDate: '2024-01-15',
        hoursWorked: 8,
        activities: 'Coding',
      };
      const log = { id, tenantId, ...dto };
      const placement = { id: dto.placementId, tenantId, totalHoursLogged: 10 };
      logRepo.create.mockReturnValue(log);
      logRepo.save.mockResolvedValue(log);
      placementRepo.findOne.mockResolvedValue(placement);
      placementRepo.save.mockResolvedValue({ ...placement, totalHoursLogged: 18 });

      const result = await service.create(tenantId, dto as any);
      expect(result).toEqual(log);
      expect(placementRepo.save).toHaveBeenCalledWith(expect.objectContaining({ totalHoursLogged: 18 }));
    });
  });

  describe('findByPlacement', () => {
    it('should return logs for a placement', async () => {
      const logs = [{ id, tenantId }];
      logRepo.find.mockResolvedValue(logs);
      const result = await service.findByPlacement(tenantId, 'placement-uuid');
      expect(result).toEqual(logs);
    });
  });

  describe('findByStudent', () => {
    it('should return logs for a student', async () => {
      const logs = [{ id, tenantId }];
      logRepo.find.mockResolvedValue(logs);
      const result = await service.findByStudent(tenantId, 'student-uuid');
      expect(result).toEqual(logs);
    });
  });

  describe('review', () => {
    it('should review a log', async () => {
      const log = { id, tenantId, status: LogStatus.SUBMITTED };
      logRepo.findOne.mockResolvedValue(log);
      logRepo.save.mockImplementation(async (l) => l);
      const dto = { status: LogStatus.APPROVED, reviewedBy: 'supervisor', supervisorFeedback: 'Good job' };
      const result = await service.review(tenantId, id, dto);
      expect(result.status).toBe(LogStatus.APPROVED);
      expect(result.reviewedBy).toBe('supervisor');
      expect(result.reviewedAt).toBeInstanceOf(Date);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      logRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(tenantId, id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a log', async () => {
      const log = { id, tenantId };
      logRepo.findOne.mockResolvedValue(log);
      logRepo.remove.mockResolvedValue(undefined);
      await expect(service.remove(tenantId, id)).resolves.toBeUndefined();
    });
  });
});
