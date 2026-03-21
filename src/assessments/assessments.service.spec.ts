import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentsService],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
  });

  describe('findAll', () => {
    it('should return an array of assessments', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return assessments with the required fields', () => {
      const result = service.findAll();
      result.forEach((a) => {
        expect(a).toHaveProperty('id');
        expect(a).toHaveProperty('studentId');
        expect(a).toHaveProperty('courseId');
        expect(a).toHaveProperty('type');
        expect(a).toHaveProperty('score');
        expect(a).toHaveProperty('maxScore');
        expect(a).toHaveProperty('completedAt');
        expect(a).toHaveProperty('feedback');
        expect(a).toHaveProperty('skills');
        expect(['micro', 'portfolio', 'project']).toContain(a.type);
      });
    });
  });

  describe('findOne', () => {
    it('should return the correct assessment for a valid id', () => {
      const result = service.findOne('as-001');
      expect(result).toBeDefined();
      expect(result!.id).toBe('as-001');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('as-999');
      expect(result).toBeUndefined();
    });
  });

  describe('findByStudent', () => {
    it('should return only assessments for the given student', () => {
      const result = service.findByStudent('st-001');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((a) => expect(a.studentId).toBe('st-001'));
    });
  });

  describe('getStudentProgress', () => {
    it('should return a progress summary for a student with assessments', () => {
      const progress = service.getStudentProgress('st-001');
      expect(progress.studentId).toBe('st-001');
      expect(progress.totalAssessments).toBeGreaterThan(0);
      expect(progress.averageScore).toBeGreaterThanOrEqual(0);
      expect(progress.averageScore).toBeLessThanOrEqual(1);
      expect(Array.isArray(progress.masteredSkills)).toBe(true);
      expect(typeof progress.atRisk).toBe('boolean');
    });

    it('should return zeroed progress for a student with no assessments', () => {
      const progress = service.getStudentProgress('st-999');
      expect(progress.totalAssessments).toBe(0);
      expect(progress.averageScore).toBe(0);
      expect(progress.masteredSkills).toEqual([]);
      expect(progress.atRisk).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a new assessment and return it', () => {
      const before = service.findAll().length;
      const created = service.create({
        studentId: 'st-001',
        courseId: 'co-001',
        type: 'micro',
        score: 8,
        maxScore: 10,
        feedback: 'Good work',
        skills: ['functions'],
      });
      expect(created).toHaveProperty('id');
      expect(created.score).toBe(8);
      expect(service.findAll().length).toBe(before + 1);
    });
  });
});
