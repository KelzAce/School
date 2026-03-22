import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course, CourseStatus } from './entities/course.entity';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
});

describe('CoursesService', () => {
  let service: CoursesService;
  let repo: MockRepository<Course>;

  const tenantId = '00000000-0000-0000-0000-000000000001';

  const mockCourse: Course = {
    id: '00000000-0000-0000-0000-000000000050',
    tenantId,
    tenant: null as any,
    programId: null,
    program: null,
    code: 'CS-101',
    title: 'Introduction to Python',
    description: 'A beginner Python course',
    learningTrack: 'STEM',
    difficulty: 'beginner',
    isAsynchronous: true,
    credits: 4,
    modules: [],
    status: CourseStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Course;

  beforeEach(async () => {
    repo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: repo },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  describe('create', () => {
    it('should create a course', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockCourse);
      repo.save!.mockResolvedValue(mockCourse);

      const result = await service.create(tenantId, {
        code: 'CS-101',
        title: 'Introduction to Python',
      });
      expect(result).toEqual(mockCourse);
    });

    it('should throw ConflictException for duplicate code', async () => {
      repo.findOne!.mockResolvedValue(mockCourse);

      await expect(
        service.create(tenantId, { code: 'CS-101', title: 'Duplicate' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      repo.findAndCount!.mockResolvedValue([[mockCourse], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by learning track', async () => {
      repo.findAndCount!.mockResolvedValue([[mockCourse], 1]);

      await service.findAll(tenantId, { page: 1, limit: 20 }, 'STEM');
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId, learningTrack: 'STEM' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a course', async () => {
      repo.findOne!.mockResolvedValue(mockCourse);

      const result = await service.findOne(tenantId, mockCourse.id);
      expect(result.id).toBe(mockCourse.id);
    });

    it('should throw NotFoundException for unknown id', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const updated = { ...mockCourse, title: 'Advanced Python' };
      repo.findOne!.mockResolvedValue(mockCourse);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update(tenantId, mockCourse.id, {
        title: 'Advanced Python',
      });
      expect(result.title).toBe('Advanced Python');
    });
  });

  describe('remove', () => {
    it('should remove a course', async () => {
      repo.findOne!.mockResolvedValue(mockCourse);
      repo.remove!.mockResolvedValue(mockCourse);

      const result = await service.remove(tenantId, mockCourse.id);
      expect(repo.remove).toHaveBeenCalledWith(mockCourse);
    });
  });
});
