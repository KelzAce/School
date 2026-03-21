import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

describe('SchedulesController', () => {
  let controller: SchedulesController;
  let service: SchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [SchedulesService],
    }).compile();

    controller = module.get<SchedulesController>(SchedulesController);
    service = module.get<SchedulesService>(SchedulesService);
  });

  describe('findAll', () => {
    it('should return all slots when no filter is provided', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(service.findAll().length);
    });

    it('should return filtered slots when studentId is provided', () => {
      const result = controller.findAll('st-001');
      result.forEach((slot) => expect(slot.studentId).toBe('st-001'));
    });
  });

  describe('findOne', () => {
    it('should return a single slot by id', () => {
      const result = controller.findOne('sc-001');
      expect(result.id).toBe('sc-001');
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('sc-999')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new slot', () => {
      const before = controller.findAll().length;
      const created = controller.create({
        studentId: 'st-002',
        courseId: 'co-003',
        type: 'live',
        scheduledAt: '2025-03-01T09:00:00Z',
        durationMinutes: 60,
      });
      expect(created).toHaveProperty('id');
      expect(created.status).toBe('booked');
      expect(controller.findAll().length).toBe(before + 1);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a slot', () => {
      const updated = controller.updateStatus('sc-003', 'cancelled');
      expect(updated.status).toBe('cancelled');
    });

    it('should throw NotFoundException for an unknown slot id', () => {
      expect(() => controller.updateStatus('sc-999', 'completed')).toThrow(
        NotFoundException,
      );
    });
  });
});
