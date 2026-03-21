import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { StudentProfile, StudentStatus } from './entities/student-profile.entity';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
});

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;
  let enrollmentRepo: MockRepository<Enrollment>;
  let studentRepo: MockRepository<StudentProfile>;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const studentProfileId = '00000000-0000-0000-0000-000000000010';
  const programId = '00000000-0000-0000-0000-000000000030';

  const mockEnrollment: Enrollment = {
    id: '00000000-0000-0000-0000-000000000040',
    tenantId,
    studentProfileId,
    programId,
    status: EnrollmentStatus.PENDING,
    appliedAt: new Date(),
    enrolledAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Enrollment;

  const mockStudent: StudentProfile = {
    id: studentProfileId,
    tenantId,
  } as StudentProfile;

  beforeEach(async () => {
    enrollmentRepo = createMockRepository();
    studentRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: getRepositoryToken(Enrollment), useValue: enrollmentRepo },
        { provide: getRepositoryToken(StudentProfile), useValue: studentRepo },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  describe('create', () => {
    it('should create an enrollment', async () => {
      studentRepo.findOne!.mockResolvedValue(mockStudent);
      enrollmentRepo.create!.mockReturnValue(mockEnrollment);
      enrollmentRepo.save!.mockResolvedValue(mockEnrollment);

      const result = await service.create(tenantId, { studentProfileId, programId });
      expect(result).toEqual(mockEnrollment);
    });

    it('should throw NotFoundException if student not in tenant', async () => {
      studentRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.create(tenantId, { studentProfileId, programId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated enrollments', async () => {
      enrollmentRepo.findAndCount!.mockResolvedValue([[mockEnrollment], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findByStudent', () => {
    it('should return enrollments for a student', async () => {
      enrollmentRepo.find!.mockResolvedValue([mockEnrollment]);

      const result = await service.findByStudent(tenantId, studentProfileId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an enrollment by id', async () => {
      enrollmentRepo.findOne!.mockResolvedValue(mockEnrollment);

      const result = await service.findOne(tenantId, mockEnrollment.id);
      expect(result.id).toBe(mockEnrollment.id);
    });

    it('should throw NotFoundException for unknown id', async () => {
      enrollmentRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should approve a pending enrollment', async () => {
      const approved = { ...mockEnrollment, status: EnrollmentStatus.APPROVED };
      enrollmentRepo.findOne!.mockResolvedValue({ ...mockEnrollment });
      enrollmentRepo.save!.mockResolvedValue(approved);

      const result = await service.updateStatus(tenantId, mockEnrollment.id, {
        status: EnrollmentStatus.APPROVED,
      });
      expect(result.status).toBe(EnrollmentStatus.APPROVED);
    });

    it('should activate an approved enrollment and update student', async () => {
      const approvedEnrollment = { ...mockEnrollment, status: EnrollmentStatus.APPROVED };
      enrollmentRepo.findOne!.mockResolvedValue(approvedEnrollment);
      enrollmentRepo.save!.mockResolvedValue({
        ...approvedEnrollment,
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: expect.any(Date),
      });
      studentRepo.update!.mockResolvedValue({ affected: 1 });

      const result = await service.updateStatus(tenantId, mockEnrollment.id, {
        status: EnrollmentStatus.ACTIVE,
      });
      expect(studentRepo.update).toHaveBeenCalledWith(
        studentProfileId,
        expect.objectContaining({ status: StudentStatus.ENROLLED }),
      );
    });

    it('should throw BadRequestException for invalid transition', async () => {
      const completed = { ...mockEnrollment, status: EnrollmentStatus.COMPLETED };
      enrollmentRepo.findOne!.mockResolvedValue(completed);

      await expect(
        service.updateStatus(tenantId, mockEnrollment.id, {
          status: EnrollmentStatus.PENDING,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
