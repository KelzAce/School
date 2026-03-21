import { Test, TestingModule } from '@nestjs/testing';
import { PainPointsService } from './pain-points.service';

describe('PainPointsService', () => {
  let service: PainPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PainPointsService],
    }).compile();

    service = module.get<PainPointsService>(PainPointsService);
  });

  describe('findAll', () => {
    it('should return an array of pain points', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return pain points with the required fields', () => {
      const result = service.findAll();
      result.forEach((painPoint) => {
        expect(painPoint).toHaveProperty('id');
        expect(painPoint).toHaveProperty('title');
        expect(painPoint).toHaveProperty('description');
        expect(painPoint).toHaveProperty('category');
        expect(painPoint).toHaveProperty('nextActions');
        expect(Array.isArray(painPoint.nextActions)).toBe(true);
      });
    });

    it('should return pain points whose nextActions each have the required fields', () => {
      const result = service.findAll();
      result.forEach((painPoint) => {
        painPoint.nextActions.forEach((action) => {
          expect(action).toHaveProperty('id');
          expect(action).toHaveProperty('action');
          expect(action).toHaveProperty('priority');
          expect(['high', 'medium', 'low']).toContain(action.priority);
        });
      });
    });

    it('should include all six traditional pain points', () => {
      const result = service.findAll();
      expect(result.length).toBe(6);
    });
  });

  describe('findOne', () => {
    it('should return the correct pain point for a valid id', () => {
      const result = service.findOne('pp-001');
      expect(result).toBeDefined();
      expect(result!.id).toBe('pp-001');
      expect(result!.title).toBe('Rigid Timetables');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('pp-999');
      expect(result).toBeUndefined();
    });
  });
});
