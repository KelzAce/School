import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  describe('findAll', () => {
    it('should return an array of courses', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return courses with the required fields', () => {
      const result = service.findAll();
      result.forEach((course) => {
        expect(course).toHaveProperty('id');
        expect(course).toHaveProperty('title');
        expect(course).toHaveProperty('description');
        expect(course).toHaveProperty('track');
        expect(course).toHaveProperty('difficulty');
        expect(course).toHaveProperty('isAsynchronous');
        expect(course).toHaveProperty('modules');
        expect(Array.isArray(course.modules)).toBe(true);
      });
    });
  });

  describe('findOne', () => {
    it('should return the correct course for a valid id', () => {
      const result = service.findOne('co-001');
      expect(result).toBeDefined();
      expect(result!.id).toBe('co-001');
      expect(result!.track).toBe('STEM');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('co-999');
      expect(result).toBeUndefined();
    });
  });

  describe('findByTrack', () => {
    it('should return only courses matching the given track', () => {
      const result = service.findByTrack('STEM');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((course) => expect(course.track).toBe('STEM'));
    });

    it('should return an empty array when no courses match the track', () => {
      const result = service.findByTrack('Trades');
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new course and return it', () => {
      const before = service.findAll().length;
      const created = service.create({
        title: 'New Course',
        description: 'A new test course',
        track: 'General',
        difficulty: 'beginner',
        isAsynchronous: true,
      });
      expect(created).toHaveProperty('id');
      expect(created.modules).toEqual([]);
      expect(service.findAll().length).toBe(before + 1);
    });
  });
});
