import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentProfile, StudentStatus } from './entities/student-profile.entity';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
});

describe('StudentsService', () => {
  let service: StudentsService;
  let repo: MockRepository<StudentProfile>;

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
    repo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(StudentProfile), useValue: repo },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  describe('create', () => {
    it('should create a student profile', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockProfile);
      repo.save!.mockResolvedValue(mockProfile);

      const result = await service.create(tenantId, {
        userId: mockProfile.userId,
        studentNumber: 'STU-001',
        learningTrack: 'STEM',
      });

      expect(result).toEqual(mockProfile);
      expect(repo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate student number', async () => {
      repo.findOne!.mockResolvedValue(mockProfile);

      await expect(
        service.create(tenantId, {
          userId: mockProfile.userId,
          studentNumber: 'STU-001',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated students', async () => {
      repo.findAndCount!.mockResolvedValue([[mockProfile], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a student profile', async () => {
      repo.findOne!.mockResolvedValue(mockProfile);

      const result = await service.findOne(tenantId, mockProfile.id);
      expect(result.id).toBe(mockProfile.id);
    });

    it('should throw NotFoundException for unknown id', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a student profile', async () => {
      const updated = { ...mockProfile, address: '456 New St' };
      repo.findOne!.mockResolvedValue(mockProfile);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update(tenantId, mockProfile.id, {
        address: '456 New St',
      });
      expect(result.address).toBe('456 New St');
    });

    it('should throw ConflictException for duplicate student number on update', async () => {
      const other = { ...mockProfile, id: 'other-id', studentNumber: 'STU-002' };
      repo.findOne!
        .mockResolvedValueOnce(mockProfile) // findOne for the profile
        .mockResolvedValueOnce(other);       // findOne for conflict check

      await expect(
        service.update(tenantId, mockProfile.id, { studentNumber: 'STU-002' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
