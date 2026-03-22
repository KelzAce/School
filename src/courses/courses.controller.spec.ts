import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course, CourseStatus } from './entities/course.entity';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: Partial<Record<keyof CoursesService, jest.Mock>>;

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
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByProgram: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: service }],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      const result = {
        data: [mockCourse],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      service.findAll!.mockResolvedValue(result);

      expect(await controller.findAll(tenantId, { page: 1, limit: 20 })).toEqual(result);
    });

    it('should pass track filter', async () => {
      const result = { data: [mockCourse], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      service.findAll!.mockResolvedValue(result);

      await controller.findAll(tenantId, { page: 1, limit: 20 }, 'STEM');
      expect(service.findAll).toHaveBeenCalledWith(tenantId, { page: 1, limit: 20 }, 'STEM');
    });
  });

  describe('findOne', () => {
    it('should return a course', async () => {
      service.findOne!.mockResolvedValue(mockCourse);

      expect(await controller.findOne(tenantId, mockCourse.id)).toEqual(mockCourse);
    });

    it('should propagate NotFoundException', async () => {
      service.findOne!.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(tenantId, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a course', async () => {
      service.create!.mockResolvedValue(mockCourse);

      const result = await controller.create(tenantId, {
        code: 'CS-101',
        title: 'Introduction to Python',
      });
      expect(result).toEqual(mockCourse);
    });
  });

  describe('update', () => {
    it('should update and return a course', async () => {
      const updated = { ...mockCourse, title: 'Advanced Python' };
      service.update!.mockResolvedValue(updated);

      const result = await controller.update(tenantId, mockCourse.id, { title: 'Advanced Python' });
      expect(result.title).toBe('Advanced Python');
    });
  });

  describe('remove', () => {
    it('should remove a course', async () => {
      service.remove!.mockResolvedValue(mockCourse);

      await controller.remove(tenantId, mockCourse.id);
      expect(service.remove).toHaveBeenCalledWith(tenantId, mockCourse.id);
    });
  });
});
