import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { ClassSessionsService } from './class-sessions.service';
import {
  ClassSession,
  SessionType,
  SessionStatus,
  DayOfWeek,
} from './entities/class-session.entity';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid-1';

const mockSession: Partial<ClassSession> = {
  id: 'session-uuid-1',
  tenantId,
  cohortId: 'cohort-uuid-1',
  courseId: 'course-uuid-1',
  instructorProfileId: 'instructor-uuid-1',
  title: 'Intro to Welding - Lecture',
  description: null,
  sessionType: SessionType.LECTURE,
  room: 'Room 101',
  dayOfWeek: DayOfWeek.MONDAY,
  startTime: '09:00',
  endTime: '10:30',
  effectiveDate: '2026-03-01',
  expiryDate: null,
  status: SessionStatus.SCHEDULED,
  tenant: null as any,
  cohort: null as any,
  course: null as any,
  instructorProfile: null as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ClassSessionsService', () => {
  let service: ClassSessionsService;
  let repo: MockRepository<ClassSession>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassSessionsService,
        {
          provide: getRepositoryToken(ClassSession),
          useValue: createMockRepository<ClassSession>(),
        },
      ],
    }).compile();

    service = module.get<ClassSessionsService>(ClassSessionsService);
    repo = module.get(getRepositoryToken(ClassSession));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      cohortId: 'cohort-uuid-1',
      courseId: 'course-uuid-1',
      instructorProfileId: 'instructor-uuid-1',
      title: 'Intro to Welding - Lecture',
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: '09:00',
      endTime: '10:30',
    };

    it('should create a class session', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockSession);
      repo.save!.mockResolvedValue(mockSession);

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(mockSession);
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException on schedule conflict', async () => {
      repo.findOne!.mockResolvedValue(mockSession);
      await expect(service.create(tenantId, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated sessions', async () => {
      repo.findAndCount!.mockResolvedValue([[mockSession], 1]);
      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toEqual([mockSession]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a session by id', async () => {
      repo.findOne!.mockResolvedValue(mockSession);
      const result = await service.findOne(tenantId, 'session-uuid-1');
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCohort', () => {
    it('should return sessions by cohort', async () => {
      repo.find!.mockResolvedValue([mockSession]);
      const result = await service.findByCohort(tenantId, 'cohort-uuid-1');
      expect(result).toEqual([mockSession]);
    });
  });

  describe('findByInstructor', () => {
    it('should return sessions by instructor', async () => {
      repo.find!.mockResolvedValue([mockSession]);
      const result = await service.findByInstructor(
        tenantId,
        'instructor-uuid-1',
      );
      expect(result).toEqual([mockSession]);
    });
  });

  describe('update', () => {
    it('should update a class session', async () => {
      const updated = { ...mockSession, room: 'Room 202' };
      repo.findOne!.mockResolvedValue({ ...mockSession });
      repo.save!.mockResolvedValue(updated);

      const result = await service.update(tenantId, 'session-uuid-1', {
        room: 'Room 202',
      });
      expect(result.room).toBe('Room 202');
    });
  });

  describe('remove', () => {
    it('should remove a class session', async () => {
      repo.findOne!.mockResolvedValue(mockSession);
      repo.remove!.mockResolvedValue(mockSession);

      await service.remove(tenantId, 'session-uuid-1');
      expect(repo.remove).toHaveBeenCalledWith(mockSession);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(
        service.remove(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
