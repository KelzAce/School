import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesService } from './schedules.service';

describe('SchedulesService', () => {
  let service: SchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulesService],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
  });

  describe('findAll', () => {
    it('should return an array of schedule slots', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return slots with the required fields', () => {
      const result = service.findAll();
      result.forEach((slot) => {
        expect(slot).toHaveProperty('id');
        expect(slot).toHaveProperty('studentId');
        expect(slot).toHaveProperty('courseId');
        expect(slot).toHaveProperty('type');
        expect(slot).toHaveProperty('scheduledAt');
        expect(slot).toHaveProperty('durationMinutes');
        expect(slot).toHaveProperty('status');
        expect(['async', 'live']).toContain(slot.type);
        expect(['booked', 'completed', 'cancelled']).toContain(slot.status);
      });
    });
  });

  describe('findOne', () => {
    it('should return the correct slot for a valid id', () => {
      const result = service.findOne('sc-001');
      expect(result).toBeDefined();
      expect(result!.id).toBe('sc-001');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('sc-999');
      expect(result).toBeUndefined();
    });
  });

  describe('findByStudent', () => {
    it('should return only slots for the given student', () => {
      const result = service.findByStudent('st-001');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((slot) => expect(slot.studentId).toBe('st-001'));
    });
  });

  describe('create', () => {
    it('should create a new slot with status "booked"', () => {
      const before = service.findAll().length;
      const created = service.create({
        studentId: 'st-003',
        courseId: 'co-002',
        type: 'async',
        scheduledAt: '2025-02-01T10:00:00Z',
        durationMinutes: 45,
      });
      expect(created).toHaveProperty('id');
      expect(created.status).toBe('booked');
      expect(service.findAll().length).toBe(before + 1);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of an existing slot', () => {
      const updated = service.updateStatus('sc-002', 'completed');
      expect(updated).toBeDefined();
      expect(updated!.status).toBe('completed');
    });

    it('should return undefined for an unknown slot id', () => {
      const updated = service.updateStatus('sc-999', 'cancelled');
      expect(updated).toBeUndefined();
    });
  });
});
