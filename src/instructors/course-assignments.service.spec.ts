import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CourseAssignmentsService } from './course-assignments.service';
import {
  CourseAssignment,
  AssignmentRole,
  AssignmentStatus,
} from './entities/course-assignment.entity';
import {
  InstructorProfile,
  InstructorStatus,
} from './entities/instructor-profile.entity';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  remove: jest.fn(),
});

describe('CourseAssignmentsService', () => {
  let service: CourseAssignmentsService;
  let assignmentRepo: MockRepository<CourseAssignment>;
  let instructorRepo: MockRepository<InstructorProfile>;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const instructorProfileId = '00000000-0000-0000-0000-000000000010';
  const courseId = '00000000-0000-0000-0000-000000000030';

  const mockInstructor = {
    id: instructorProfileId,
    tenantId,
    maxCourseLoad: 4,
    status: InstructorStatus.ACTIVE,
  } as InstructorProfile;

  const mockAssignment: CourseAssignment = {
    id: '00000000-0000-0000-0000-000000000040',
    tenantId,
    instructorProfileId,
    courseId,
    role: AssignmentRole.PRIMARY,
    status: AssignmentStatus.ACTIVE,
    assignedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as CourseAssignment;

  beforeEach(async () => {
    assignmentRepo = createMockRepository();
    instructorRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseAssignmentsService,
        {
          provide: getRepositoryToken(CourseAssignment),
          useValue: assignmentRepo,
        },
        {
          provide: getRepositoryToken(InstructorProfile),
          useValue: instructorRepo,
        },
      ],
    }).compile();

    service = module.get<CourseAssignmentsService>(CourseAssignmentsService);
  });

  describe('create', () => {
    it('should create a course assignment', async () => {
      assignmentRepo.findOne!.mockResolvedValue(null);
      instructorRepo.findOne!.mockResolvedValue(mockInstructor);
      assignmentRepo.count!.mockResolvedValue(1);
      assignmentRepo.create!.mockReturnValue(mockAssignment);
      assignmentRepo.save!.mockResolvedValue(mockAssignment);

      const result = await service.create(tenantId, {
        instructorProfileId,
        courseId,
      });

      expect(result).toEqual(mockAssignment);
    });

    it('should throw ConflictException for duplicate assignment', async () => {
      assignmentRepo.findOne!.mockResolvedValue(mockAssignment);

      await expect(
        service.create(tenantId, { instructorProfileId, courseId }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if instructor not found', async () => {
      assignmentRepo.findOne!.mockResolvedValue(null);
      instructorRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.create(tenantId, { instructorProfileId, courseId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when course load exceeded', async () => {
      assignmentRepo.findOne!.mockResolvedValue(null);
      instructorRepo.findOne!.mockResolvedValue({
        ...mockInstructor,
        maxCourseLoad: 2,
      });
      assignmentRepo.count!.mockResolvedValue(2);

      await expect(
        service.create(tenantId, { instructorProfileId, courseId }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByInstructor', () => {
    it('should return assignments for an instructor', async () => {
      assignmentRepo.find!.mockResolvedValue([mockAssignment]);

      const result = await service.findByInstructor(
        tenantId,
        instructorProfileId,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('findByCourse', () => {
    it('should return instructors for a course', async () => {
      assignmentRepo.find!.mockResolvedValue([mockAssignment]);

      const result = await service.findByCourse(tenantId, courseId);
      expect(result).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should update assignment status', async () => {
      const updated = { ...mockAssignment, status: AssignmentStatus.COMPLETED };
      assignmentRepo.findOne!.mockResolvedValue(mockAssignment);
      assignmentRepo.save!.mockResolvedValue(updated);

      const result = await service.updateStatus(tenantId, mockAssignment.id, {
        status: 'completed',
      });
      expect(result.status).toBe(AssignmentStatus.COMPLETED);
    });

    it('should throw NotFoundException for unknown assignment', async () => {
      assignmentRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.updateStatus(tenantId, 'nonexistent', { status: 'completed' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an assignment', async () => {
      assignmentRepo.findOne!.mockResolvedValue(mockAssignment);
      assignmentRepo.remove!.mockResolvedValue(mockAssignment);

      await expect(
        service.remove(tenantId, mockAssignment.id),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException for unknown assignment', async () => {
      assignmentRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.remove(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
