import { Injectable } from '@nestjs/common';

export type SessionType = 'async' | 'live';
export type ScheduleStatus = 'booked' | 'completed' | 'cancelled';

export interface ScheduleSlot {
  id: string;
  studentId: string;
  courseId: string;
  type: SessionType;
  scheduledAt: string;
  durationMinutes: number;
  status: ScheduleStatus;
}

export interface CreateScheduleSlotDto {
  studentId: string;
  courseId: string;
  type: SessionType;
  scheduledAt: string;
  durationMinutes: number;
}

@Injectable()
export class SchedulesService {
  private readonly slots: ScheduleSlot[] = [
    {
      id: 'sc-001',
      studentId: 'st-001',
      courseId: 'co-001',
      type: 'async',
      scheduledAt: '2025-01-15T09:00:00Z',
      durationMinutes: 60,
      status: 'completed',
    },
    {
      id: 'sc-002',
      studentId: 'st-001',
      courseId: 'co-001',
      type: 'live',
      scheduledAt: '2025-01-22T14:00:00Z',
      durationMinutes: 90,
      status: 'booked',
    },
    {
      id: 'sc-003',
      studentId: 'st-002',
      courseId: 'co-003',
      type: 'live',
      scheduledAt: '2025-01-20T10:00:00Z',
      durationMinutes: 120,
      status: 'booked',
    },
  ];

  private nextIdCounter = 4;

  findAll(): ScheduleSlot[] {
    return this.slots;
  }

  findOne(id: string): ScheduleSlot | undefined {
    return this.slots.find((s) => s.id === id);
  }

  findByStudent(studentId: string): ScheduleSlot[] {
    return this.slots.filter((s) => s.studentId === studentId);
  }

  create(dto: CreateScheduleSlotDto): ScheduleSlot {
    const slot: ScheduleSlot = {
      id: `sc-${String(this.nextIdCounter++).padStart(3, '0')}`,
      ...dto,
      status: 'booked',
    };
    this.slots.push(slot);
    return slot;
  }

  updateStatus(
    id: string,
    status: ScheduleStatus,
  ): ScheduleSlot | undefined {
    const slot = this.findOne(id);
    if (!slot) return undefined;
    slot.status = status;
    return slot;
  }
}
