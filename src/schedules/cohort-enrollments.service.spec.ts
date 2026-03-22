import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { CohortEnrollmentsService } from './cohort-enrollments.service';
import {
  CohortEnrollment,
  CohortEnrollmentStatus,
} from './entities/cohort-enrollment.entity';
import { Cohort, CohortStatus } from './entities/cohort.entity';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
});

const tenantId = 'tenant-uuid-1';

const mockCohort: Partial<Cohort> = {
  id: 'cohort-uuid-1',
  tenantId,
  status: CohortStatus.FORMING,
  maxCapacity: 30,
};

const mockEnrollment: Partial<CohortEnrollment> = {
  id: 'enrollment-uuid-1',
  tenantId,
  cohortId: 'cohort-uuid-1',
  studentProfileId: 'student-uuid-1',
  status: CohortEnrollmentStatus.ACTIVE,
  enrolledAt: new Date(),
  completedAt: null,
  tenant: null as any,
  cohort: null as any,
  studentProfile: null as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CohortEnrollmentsService', () => {
  let service: CohortEnrollmentsService;
  let enrollmentRepo: MockRepository<CohortEnrollment>;
  let cohortRepo: MockRepository<Cohort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CohortEnrollmentsService,
        {
          provide: getRepositoryToken(CohortEnrollment),
          useValue: createMockRepository<CohortEnrollment>(),
        },
        {
          provide: getRepositoryToken(Cohort),
          useValue: createMockRepository<Cohort>(),
        },
      ],
    }).compile();

    service = module.get<CohortEnrollmentsService>(CohortEnrollmentsService);
    enrollmentRepo = module.get(getRepositoryToken(CohortEnrollment));
    cohortRepo = module.get(getRepositoryToken(Cohort));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enroll', () => {
    const dto = {
      cohortId: 'cohort-uuid-1',
      studentProfileId: 'student-uuid-1',
    };

    it('should enroll a student in a cohort', async () => {
      cohortRepo.findOne!.mockResolvedValue(mockCohort);
      enrollmentRepo.count!.mockResolvedValue(0);
      enrollmentRepo.findOne!.mockResolvedValue(null);
      enrollmentRepo.create!.mockReturnValue(mockEnrollment);
      enrollmentRepo.save!.mockResolvedValue(mockEnrollment);

      const result = await service.enroll(tenantId, dto);
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw NotFoundException if cohort not found', async () => {
      cohortRepo.findOne!.mockResolvedValue(null);
      await expect(service.enroll(tenantId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if cohort is completed', async () => {
      cohortRepo.findOne!.mockResolvedValue({
        ...mockCohort,
        status: CohortStatus.COMPLETED,
      });
      await expect(service.enroll(tenantId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if cohort is at capacity', async () => {
      cohortRepo.findOne!.mockResolvedValue(mockCohort);
      enrollmentRepo.count!.mockResolvedValue(30);
      await expect(service.enroll(tenantId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if already enrolled', async () => {
      cohortRepo.findOne!.mockResolvedValue(mockCohort);
      enrollmentRepo.count!.mockResolvedValue(0);
      enrollmentRepo.findOne!.mockResolvedValue(mockEnrollment);
      await expect(service.enroll(tenantId, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByCohort', () => {
    it('should return enrollments by cohort', async () => {
      enrollmentRepo.find!.mockResolvedValue([mockEnrollment]);
      const result = await service.findByCohort(tenantId, 'cohort-uuid-1');
      expect(result).toEqual([mockEnrollment]);
    });
  });

  describe('findByStudent', () => {
    it('should return enrollments by student', async () => {
      enrollmentRepo.find!.mockResolvedValue([mockEnrollment]);
      const result = await service.findByStudent(tenantId, 'student-uuid-1');
      expect(result).toEqual([mockEnrollment]);
    });
  });

  describe('updateStatus', () => {
    it('should update enrollment status', async () => {
      const updated = {
        ...mockEnrollment,
        status: CohortEnrollmentStatus.COMPLETED,
      };
      enrollmentRepo.findOne!.mockResolvedValue({ ...mockEnrollment });
      enrollmentRepo.save!.mockResolvedValue(updated);

      const result = await service.updateStatus(
        tenantId,
        'enrollment-uuid-1',
        { status: CohortEnrollmentStatus.COMPLETED },
      );
      expect(result.status).toBe(CohortEnrollmentStatus.COMPLETED);
    });

    it('should throw NotFoundException if not found', async () => {
      enrollmentRepo.findOne!.mockResolvedValue(null);
      await expect(
        service.updateStatus(tenantId, 'nonexistent', {
          status: CohortEnrollmentStatus.WITHDRAWN,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an enrollment', async () => {
      enrollmentRepo.findOne!.mockResolvedValue(mockEnrollment);
      enrollmentRepo.remove!.mockResolvedValue(mockEnrollment);

      await service.remove(tenantId, 'enrollment-uuid-1');
      expect(enrollmentRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not found', async () => {
      enrollmentRepo.findOne!.mockResolvedValue(null);
      await expect(
        service.remove(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
