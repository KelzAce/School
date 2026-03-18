import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PainPointsController } from './pain-points.controller';
import { PainPointsService } from './pain-points.service';

describe('PainPointsController', () => {
  let controller: PainPointsController;
  let service: PainPointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PainPointsController],
      providers: [PainPointsService],
    }).compile();

    controller = module.get<PainPointsController>(PainPointsController);
    service = module.get<PainPointsService>(PainPointsService);
  });

  describe('findAll', () => {
    it('should return all pain points', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(service.findAll().length);
    });

    it('should include nextActions for every pain point', () => {
      const result = controller.findAll();
      result.forEach((painPoint) => {
        expect(painPoint.nextActions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('findOne', () => {
    it('should return a single pain point by id', () => {
      const result = controller.findOne('pp-001');
      expect(result.id).toBe('pp-001');
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('pp-999')).toThrow(NotFoundException);
    });
  });
});
