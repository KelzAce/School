import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StudentProfile, StudentStatus } from './entities/student-profile.entity';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: Partial<Record<keyof StudentsService, jest.Mock>>;

  const tenantId = '00000000-0000-0000-0000-000000000001';

  const mockProfile: StudentProfile = {
    id: '00000000-0000-0000-0000-000000000010',
    tenantId,
    userId: '00000000-0000-0000-0000-000000000020',
    studentNumber: 'STU-001',
    dateOfBirth: null,
    address: null,
    emergencyContact: null,
    careerAspirations: null,
    priorCompetencies: null,
    learningTrack: 'STEM',
    status: StudentStatus.APPLICANT,
    enrollmentDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as StudentProfile;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: service }],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
  });

  describe('findAll', () => {
    it('should return paginated students', async () => {
      const result = { data: [mockProfile], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      service.findAll!.mockResolvedValue(result);

      expect(await controller.findAll(tenantId, { page: 1, limit: 20 })).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a student profile', async () => {
      service.findOne!.mockResolvedValue(mockProfile);

      expect(await controller.findOne(tenantId, mockProfile.id)).toEqual(mockProfile);
    });

    it('should propagate NotFoundException', async () => {
      service.findOne!.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(tenantId, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a student profile', async () => {
      service.create!.mockResolvedValue(mockProfile);

      const result = await controller.create(tenantId, {
        userId: mockProfile.userId,
        studentNumber: 'STU-001',
      });
      expect(result).toEqual(mockProfile);
    });
  });

  describe('update', () => {
    it('should update and return the profile', async () => {
      const updated = { ...mockProfile, address: 'New Address' };
      service.update!.mockResolvedValue(updated);

      const result = await controller.update(tenantId, mockProfile.id, { address: 'New Address' });
      expect(result.address).toBe('New Address');
    });
  });
});
