import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [StudentsService],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  describe('findAll', () => {
    it('should return all students', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(service.findAll().length);
    });
  });

  describe('findOne', () => {
    it('should return a single student by id', () => {
      const result = controller.findOne('st-001');
      expect(result.id).toBe('st-001');
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('st-999')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new student', () => {
      const before = controller.findAll().length;
      const created = controller.create({
        name: 'New Student',
        email: 'new@school.example',
        gradeLevel: 'Grade 7',
        learningTrack: 'Trades',
      });
      expect(created).toHaveProperty('id');
      expect(created.name).toBe('New Student');
      expect(controller.findAll().length).toBe(before + 1);
    });
  });

  describe('update', () => {
    it('should update and return the student', () => {
      const updated = controller.update('st-002', { gradeLevel: 'Grade 11' });
      expect(updated.gradeLevel).toBe('Grade 11');
    });

    it('should throw NotFoundException when updating a non-existent student', () => {
      expect(() =>
        controller.update('st-999', { gradeLevel: 'Grade 11' }),
      ).toThrow(NotFoundException);
    });
  });
});
