import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { CohortsService } from './cohorts.service';
import { Cohort, CohortStatus } from './entities/cohort.entity';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
});

const tenantId = 'tenant-uuid-1';

const mockCohort: Partial<Cohort> = {
  id: 'cohort-uuid-1',
  tenantId,
  programId: 'program-uuid-1',
  code: 'COH-2026-01',
  name: 'Spring 2026 Cohort',
  description: 'First spring cohort',
  startDate: '2026-03-01',
  endDate: '2026-06-30',
  maxCapacity: 30,
  status: CohortStatus.FORMING,
  tenant: null as any,
  program: null as any,
  classSessions: [],
  cohortEnrollments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CohortsService', () => {
  let service: CohortsService;
  let repo: MockRepository<Cohort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CohortsService,
        {
          provide: getRepositoryToken(Cohort),
          useValue: createMockRepository<Cohort>(),
        },
      ],
    }).compile();

    service = module.get<CohortsService>(CohortsService);
    repo = module.get(getRepositoryToken(Cohort));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      programId: 'program-uuid-1',
      code: 'COH-2026-01',
      name: 'Spring 2026 Cohort',
      startDate: '2026-03-01',
    };

    it('should create a cohort', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockCohort);
      repo.save!.mockResolvedValue(mockCohort);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(mockCohort);
      expect(repo.create).toHaveBeenCalledWith({ tenantId, ...dto });
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if code exists', async () => {
      repo.findOne!.mockResolvedValue(mockCohort);
      await expect(service.create(tenantId, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated cohorts', async () => {
      repo.findAndCount!.mockResolvedValue([[mockCohort], 1]);
      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toEqual([mockCohort]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a cohort by id', async () => {
      repo.findOne!.mockResolvedValue(mockCohort);
      const result = await service.findOne(tenantId, 'cohort-uuid-1');
      expect(result).toEqual(mockCohort);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProgram', () => {
    it('should return cohorts by program', async () => {
      repo.find!.mockResolvedValue([mockCohort]);
      const result = await service.findByProgram(tenantId, 'program-uuid-1');
      expect(result).toEqual([mockCohort]);
    });
  });

  describe('update', () => {
    it('should update a cohort', async () => {
      const updated = { ...mockCohort, name: 'Updated Cohort' };
      repo.findOne!.mockResolvedValue({ ...mockCohort });
      repo.save!.mockResolvedValue(updated);

      const result = await service.update(tenantId, 'cohort-uuid-1', {
        name: 'Updated Cohort',
      });
      expect(result.name).toBe('Updated Cohort');
    });
  });

  describe('remove', () => {
    it('should remove a cohort', async () => {
      repo.findOne!.mockResolvedValue(mockCohort);
      repo.remove!.mockResolvedValue(mockCohort);

      await service.remove(tenantId, 'cohort-uuid-1');
      expect(repo.remove).toHaveBeenCalledWith(mockCohort);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(
        service.remove(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
