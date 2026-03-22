import { Test, TestingModule } from '@nestjs/testing';
import { CohortsController } from './schedules.controller';
import { CohortsService } from './cohorts.service';
import { CohortStatus } from './entities/cohort.entity';

const tenantId = 'tenant-uuid-1';

const mockCohort = {
  id: 'cohort-uuid-1',
  tenantId,
  programId: 'program-uuid-1',
  code: 'COH-2026-01',
  name: 'Spring 2026 Cohort',
  startDate: '2026-03-01',
  maxCapacity: 30,
  status: CohortStatus.FORMING,
};

describe('CohortsController', () => {
  let controller: CohortsController;
  let service: Partial<Record<keyof CohortsService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(mockCohort),
      findAll: jest
        .fn()
        .mockResolvedValue({ data: [mockCohort], total: 1, page: 1, limit: 20 }),
      findOne: jest.fn().mockResolvedValue(mockCohort),
      findByProgram: jest.fn().mockResolvedValue([mockCohort]),
      update: jest
        .fn()
        .mockResolvedValue({ ...mockCohort, name: 'Updated' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CohortsController],
      providers: [{ provide: CohortsService, useValue: service }],
    }).compile();

    controller = module.get<CohortsController>(CohortsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cohort', async () => {
      const result = await controller.create(tenantId, {
        programId: 'program-uuid-1',
        code: 'COH-2026-01',
        name: 'Spring 2026 Cohort',
        startDate: '2026-03-01',
      });
      expect(result).toEqual(mockCohort);
      expect(service.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated cohorts', async () => {
      const result = await controller.findAll(tenantId, {
        page: 1,
        limit: 20,
      });
      expect(result.data).toEqual([mockCohort]);
    });
  });

  describe('findOne', () => {
    it('should return a cohort by id', async () => {
      const result = await controller.findOne(tenantId, 'cohort-uuid-1');
      expect(result).toEqual(mockCohort);
    });
  });

  describe('findByProgram', () => {
    it('should return cohorts by program', async () => {
      const result = await controller.findByProgram(
        tenantId,
        'program-uuid-1',
      );
      expect(result).toEqual([mockCohort]);
    });
  });

  describe('update', () => {
    it('should update a cohort', async () => {
      const result = await controller.update(tenantId, 'cohort-uuid-1', {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a cohort', async () => {
      await controller.remove(tenantId, 'cohort-uuid-1');
      expect(service.remove).toHaveBeenCalledWith(tenantId, 'cohort-uuid-1');
    });
  });
});
