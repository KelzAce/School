import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';

describe('AssessmentsController', () => {
  let controller: AssessmentsController;
  let service: AssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentsController],
      providers: [AssessmentsService],
    }).compile();

    controller = module.get<AssessmentsController>(AssessmentsController);
    service = module.get<AssessmentsService>(AssessmentsService);
  });

  describe('findAll', () => {
    it('should return all assessments when no filter is provided', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(service.findAll().length);
    });

    it('should return filtered assessments when studentId is provided', () => {
      const result = controller.findAll('st-001');
      result.forEach((a) => expect(a.studentId).toBe('st-001'));
    });
  });

  describe('getProgress', () => {
    it('should return a progress summary for a student', () => {
      const progress = controller.getProgress('st-001');
      expect(progress.studentId).toBe('st-001');
      expect(progress).toHaveProperty('totalAssessments');
      expect(progress).toHaveProperty('averageScore');
      expect(progress).toHaveProperty('masteredSkills');
      expect(progress).toHaveProperty('atRisk');
    });
  });

  describe('findOne', () => {
    it('should return a single assessment by id', () => {
      const result = controller.findOne('as-001');
      expect(result.id).toBe('as-001');
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('as-999')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new assessment', () => {
      const before = controller.findAll().length;
      const created = controller.create({
        studentId: 'st-002',
        courseId: 'co-003',
        type: 'project',
        score: 45,
        maxScore: 50,
        feedback: 'Excellent project',
        skills: ['design-thinking'],
      });
      expect(created).toHaveProperty('id');
      expect(controller.findAll().length).toBe(before + 1);
    });
  });
});
