import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [CoursesService],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  describe('findAll', () => {
    it('should return all courses when no track filter is provided', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(service.findAll().length);
    });

    it('should return filtered courses when a track query is provided', () => {
      const result = controller.findAll('STEM');
      result.forEach((course) => expect(course.track).toBe('STEM'));
    });
  });

  describe('findOne', () => {
    it('should return a single course by id', () => {
      const result = controller.findOne('co-001');
      expect(result.id).toBe('co-001');
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('co-999')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new course', () => {
      const before = controller.findAll().length;
      const created = controller.create({
        title: 'Test Course',
        description: 'Description',
        track: 'Trades',
        difficulty: 'intermediate',
        isAsynchronous: false,
      });
      expect(created).toHaveProperty('id');
      expect(controller.findAll().length).toBe(before + 1);
    });
  });
});
