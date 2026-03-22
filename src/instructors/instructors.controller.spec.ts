import { Test, TestingModule } from '@nestjs/testing';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';
import {
  InstructorProfile,
  InstructorStatus,
} from './entities/instructor-profile.entity';

describe('InstructorsController', () => {
  let controller: InstructorsController;
  let service: Partial<Record<keyof InstructorsService, jest.Mock>>;

  const tenantId = '00000000-0000-0000-0000-000000000001';

  const mockProfile = {
    id: '00000000-0000-0000-0000-000000000010',
    tenantId,
    userId: '00000000-0000-0000-0000-000000000020',
    employeeNumber: 'INS-001',
    title: 'Senior Instructor',
    bio: null,
    specializations: ['Welding'],
    qualifications: ['B.Eng'],
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
    service = {
      create: jest.fn().mockResolvedValue(mockProfile),
      findAll: jest.fn().mockResolvedValue({
        data: [mockProfile],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      }),
      findOne: jest.fn().mockResolvedValue(mockProfile),
      update: jest.fn().mockResolvedValue(mockProfile),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstructorsController],
      providers: [{ provide: InstructorsService, useValue: service }],
    }).compile();

    controller = module.get<InstructorsController>(InstructorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an instructor profile', async () => {
      const result = await controller.create(tenantId, {
        userId: mockProfile.userId,
        employeeNumber: 'INS-001',
      });
      expect(result).toEqual(mockProfile);
      expect(service.create).toHaveBeenCalledWith(tenantId, {
        userId: mockProfile.userId,
        employeeNumber: 'INS-001',
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated instructors', async () => {
      const result = await controller.findAll(tenantId, {
        page: 1,
        limit: 20,
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an instructor by id', async () => {
      const result = await controller.findOne(tenantId, mockProfile.id);
      expect(result.id).toBe(mockProfile.id);
    });
  });

  describe('update', () => {
    it('should update an instructor profile', async () => {
      const result = await controller.update(tenantId, mockProfile.id, {
        bio: 'New bio',
      });
      expect(result).toEqual(mockProfile);
    });
  });
});
