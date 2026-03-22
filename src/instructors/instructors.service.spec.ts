import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
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
  findAndCount: jest.fn(),
});

describe('InstructorsService', () => {
  let service: InstructorsService;
  let repo: MockRepository<InstructorProfile>;

  const tenantId = '00000000-0000-0000-0000-000000000001';

  const mockProfile: InstructorProfile = {
    id: '00000000-0000-0000-0000-000000000010',
    tenantId,
    userId: '00000000-0000-0000-0000-000000000020',
    employeeNumber: 'INS-001',
    title: 'Senior Instructor',
    bio: null,
    specializations: ['Welding', 'Fabrication'],
    qualifications: ['B.Eng Mechanical'],
    certifications: [],
    yearsOfExperience: 10,
    maxCourseLoad: 4,
    hireDate: '2024-01-15',
    status: InstructorStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: null as any,
    user: null as any,
    courseAssignments: [],
  } as InstructorProfile;

  beforeEach(async () => {
    repo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorsService,
        {
          provide: getRepositoryToken(InstructorProfile),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<InstructorsService>(InstructorsService);
  });

  describe('create', () => {
    it('should create an instructor profile', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockProfile);
      repo.save!.mockResolvedValue(mockProfile);

      const result = await service.create(tenantId, {
        userId: mockProfile.userId,
        employeeNumber: 'INS-001',
        specializations: ['Welding', 'Fabrication'],
      });

      expect(result).toEqual(mockProfile);
      expect(repo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate employee number', async () => {
      repo.findOne!.mockResolvedValue(mockProfile);

      await expect(
        service.create(tenantId, {
          userId: mockProfile.userId,
          employeeNumber: 'INS-001',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated instructors', async () => {
      repo.findAndCount!.mockResolvedValue([[mockProfile], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an instructor profile', async () => {
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
    it('should update an instructor profile', async () => {
      const updated = { ...mockProfile, bio: 'Updated bio' };
      repo.findOne!.mockResolvedValue(mockProfile);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update(tenantId, mockProfile.id, {
        bio: 'Updated bio',
      });
      expect(result.bio).toBe('Updated bio');
    });

    it('should throw ConflictException when changing to taken employee number', async () => {
      repo.findOne!
        .mockResolvedValueOnce(mockProfile) // findOne in update
        .mockResolvedValueOnce({ ...mockProfile, id: 'other-id' }); // conflict check

      await expect(
        service.update(tenantId, mockProfile.id, {
          employeeNumber: 'INS-002',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
