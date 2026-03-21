import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';

describe('StudentsService', () => {
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentsService],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  describe('findAll', () => {
    it('should return an array of students', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return students with the required fields', () => {
      const result = service.findAll();
      result.forEach((student) => {
        expect(student).toHaveProperty('id');
        expect(student).toHaveProperty('name');
        expect(student).toHaveProperty('email');
        expect(student).toHaveProperty('gradeLevel');
        expect(student).toHaveProperty('learningTrack');
        expect(student).toHaveProperty('enrolledAt');
      });
    });
  });

  describe('findOne', () => {
    it('should return the correct student for a valid id', () => {
      const result = service.findOne('st-001');
      expect(result).toBeDefined();
      expect(result!.id).toBe('st-001');
      expect(result!.name).toBe('Alice Johnson');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('st-999');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new student and return it', () => {
      const before = service.findAll().length;
      const created = service.create({
        name: 'Test Student',
        email: 'test@school.example',
        gradeLevel: 'Grade 8',
        learningTrack: 'General',
      });
      expect(created).toHaveProperty('id');
      expect(created.name).toBe('Test Student');
      expect(service.findAll().length).toBe(before + 1);
    });
  });

  describe('update', () => {
    it('should update an existing student and return the updated record', () => {
      const updated = service.update('st-001', { gradeLevel: 'Grade 10' });
      expect(updated).toBeDefined();
      expect(updated!.gradeLevel).toBe('Grade 10');
    });

    it('should return undefined when updating a non-existent student', () => {
      const updated = service.update('st-999', { gradeLevel: 'Grade 10' });
      expect(updated).toBeUndefined();
    });
  });
});
