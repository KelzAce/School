import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { Enrollment, EnrollmentStatus } from '../students/entities/enrollment.entity.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { Program } from '../courses/entities/program.entity.js';
import { Course } from '../courses/entities/course.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { Cohort } from '../schedules/entities/cohort.entity.js';
import { CohortEnrollment } from '../schedules/entities/cohort-enrollment.entity.js';
import { AnalyticsGranularity } from './dto/analytics-query.dto.js';

const createMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let enrollmentRepo: ReturnType<typeof createMockRepo>;
  let studentProfileRepo: ReturnType<typeof createMockRepo>;
  let programRepo: ReturnType<typeof createMockRepo>;
  let courseRepo: ReturnType<typeof createMockRepo>;
  let masteryRecordRepo: ReturnType<typeof createMockRepo>;
  let studentSkillRepo: ReturnType<typeof createMockRepo>;
  let skillRepo: ReturnType<typeof createMockRepo>;
  let cohortRepo: ReturnType<typeof createMockRepo>;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const programId = '00000000-0000-0000-0000-000000000010';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Enrollment), useValue: createMockRepo() },
        { provide: getRepositoryToken(StudentProfile), useValue: createMockRepo() },
        { provide: getRepositoryToken(Program), useValue: createMockRepo() },
        { provide: getRepositoryToken(Course), useValue: createMockRepo() },
        { provide: getRepositoryToken(MasteryRecord), useValue: createMockRepo() },
        { provide: getRepositoryToken(StudentSkill), useValue: createMockRepo() },
        { provide: getRepositoryToken(Skill), useValue: createMockRepo() },
        { provide: getRepositoryToken(Cohort), useValue: createMockRepo() },
        { provide: getRepositoryToken(CohortEnrollment), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    enrollmentRepo = module.get(getRepositoryToken(Enrollment));
    studentProfileRepo = module.get(getRepositoryToken(StudentProfile));
    programRepo = module.get(getRepositoryToken(Program));
    courseRepo = module.get(getRepositoryToken(Course));
    masteryRecordRepo = module.get(getRepositoryToken(MasteryRecord));
    studentSkillRepo = module.get(getRepositoryToken(StudentSkill));
    skillRepo = module.get(getRepositoryToken(Skill));
    cohortRepo = module.get(getRepositoryToken(Cohort));

    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('returns correct shape with computed completion rate', async () => {
      studentProfileRepo.count.mockResolvedValue(50);
      enrollmentRepo.count
        .mockResolvedValueOnce(20) // activeEnrollments
        .mockResolvedValueOnce(10); // completedEnrollments
      programRepo.count.mockResolvedValue(5);
      courseRepo.count.mockResolvedValue(15);

      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { skillId: 'skill-1', count: '8' },
          { skillId: 'skill-2', count: '5' },
        ]),
      };
      studentSkillRepo.createQueryBuilder.mockReturnValue(qb);

      const skillQb = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'skill-1', name: 'JavaScript' },
          { id: 'skill-2', name: 'Python' },
        ]),
      };
      skillRepo.createQueryBuilder.mockReturnValue(skillQb);

      const result = await service.getOverview(tenantId);

      expect(result.totalStudents).toBe(50);
      expect(result.activeEnrollments).toBe(20);
      expect(result.completedEnrollments).toBe(10);
      expect(result.totalPrograms).toBe(5);
      expect(result.totalCourses).toBe(15);
      // 10 / (20 + 10) * 100 = 33
      expect(result.overallCompletionRate).toBe(33);
      expect(result.topSkills).toHaveLength(2);
      expect(result.topSkills[0]).toMatchObject({ skillId: 'skill-1', skillName: 'JavaScript', count: 8 });
    });

    it('returns 0 completion rate when no enrollments', async () => {
      studentProfileRepo.count.mockResolvedValue(0);
      enrollmentRepo.count.mockResolvedValue(0);
      programRepo.count.mockResolvedValue(0);
      courseRepo.count.mockResolvedValue(0);

      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      studentSkillRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getOverview(tenantId);
      expect(result.overallCompletionRate).toBe(0);
      expect(result.topSkills).toHaveLength(0);
    });
  });

  describe('getEnrollmentTrends', () => {
    it('buckets enrollments correctly by month', async () => {
      const enrollments = [
        { id: 'e1', status: EnrollmentStatus.ACTIVE, appliedAt: new Date('2025-01-15') },
        { id: 'e2', status: EnrollmentStatus.COMPLETED, appliedAt: new Date('2025-01-20') },
        { id: 'e3', status: EnrollmentStatus.ACTIVE, appliedAt: new Date('2025-02-10') },
      ];
      enrollmentRepo.find.mockResolvedValue(enrollments);

      const result = await service.getEnrollmentTrends(tenantId, {
        granularity: AnalyticsGranularity.MONTH,
        from: '2025-01-01',
        to: '2025-03-01',
      });

      expect(result.granularity).toBe(AnalyticsGranularity.MONTH);
      expect(result.data).toHaveLength(2);
      const jan = result.data.find((d) => d.period === '2025-01');
      expect(jan).toBeDefined();
      expect(jan!.total).toBe(2);
      expect(jan!.active).toBe(1);
      expect(jan!.completed).toBe(1);
    });

    it('buckets enrollments correctly by week', async () => {
      const enrollments = [
        { id: 'e1', status: EnrollmentStatus.ACTIVE, appliedAt: new Date('2025-01-06') }, // Monday
        { id: 'e2', status: EnrollmentStatus.PENDING, appliedAt: new Date('2025-01-07') }, // Tuesday same week
        { id: 'e3', status: EnrollmentStatus.WITHDRAWN, appliedAt: new Date('2025-01-13') }, // Next Monday
      ];
      enrollmentRepo.find.mockResolvedValue(enrollments);

      const result = await service.getEnrollmentTrends(tenantId, {
        granularity: AnalyticsGranularity.WEEK,
        from: '2025-01-01',
        to: '2025-02-01',
      });

      expect(result.granularity).toBe(AnalyticsGranularity.WEEK);
      expect(result.data).toHaveLength(2);
      const week1 = result.data[0];
      expect(week1.total).toBe(2);
    });

    it('buckets enrollments correctly by day', async () => {
      const enrollments = [
        { id: 'e1', status: EnrollmentStatus.ACTIVE, appliedAt: new Date('2025-01-15') },
        { id: 'e2', status: EnrollmentStatus.ACTIVE, appliedAt: new Date('2025-01-15') },
        { id: 'e3', status: EnrollmentStatus.COMPLETED, appliedAt: new Date('2025-01-16') },
      ];
      enrollmentRepo.find.mockResolvedValue(enrollments);

      const result = await service.getEnrollmentTrends(tenantId, {
        granularity: AnalyticsGranularity.DAY,
        from: '2025-01-01',
        to: '2025-02-01',
      });

      expect(result.granularity).toBe(AnalyticsGranularity.DAY);
      expect(result.data).toHaveLength(2);
      const jan15 = result.data.find((d) => d.period === '2025-01-15');
      expect(jan15!.total).toBe(2);
      expect(jan15!.active).toBe(2);
    });

    it('uses default range of 12 months when no dates provided', async () => {
      enrollmentRepo.find.mockResolvedValue([]);

      const result = await service.getEnrollmentTrends(tenantId, {});
      expect(result.granularity).toBe(AnalyticsGranularity.MONTH);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getCompletionRates', () => {
    it('computes correct overall and per-program rates', async () => {
      const enrollments = [
        { id: 'e1', status: EnrollmentStatus.ACTIVE, programId: 'prog-1', program: { name: 'Web Dev' } },
        { id: 'e2', status: EnrollmentStatus.COMPLETED, programId: 'prog-1', program: { name: 'Web Dev' } },
        { id: 'e3', status: EnrollmentStatus.COMPLETED, programId: 'prog-1', program: { name: 'Web Dev' } },
        { id: 'e4', status: EnrollmentStatus.WITHDRAWN, programId: 'prog-2', program: { name: 'Data Science' } },
        { id: 'e5', status: EnrollmentStatus.ACTIVE, programId: 'prog-2', program: { name: 'Data Science' } },
      ];
      enrollmentRepo.find.mockResolvedValue(enrollments);

      const result = await service.getCompletionRates(tenantId);

      expect(result.overall.enrolled).toBe(5);
      expect(result.overall.completed).toBe(2);
      expect(result.overall.rate).toBe(40);

      const webDev = result.byProgram.find((p) => p.programId === 'prog-1');
      expect(webDev).toBeDefined();
      expect(webDev!.completionRate).toBe(67); // 2/3 = 66.67 → 67

      const ds = result.byProgram.find((p) => p.programId === 'prog-2');
      expect(ds!.withdrawn).toBe(1);
      expect(ds!.completionRate).toBe(0);
    });
  });

  describe('getSkillVelocity', () => {
    it('returns correct mastery counts per period', async () => {
      const records = [
        { id: 'm1', achievedAt: new Date('2025-01-10') },
        { id: 'm2', achievedAt: new Date('2025-01-20') },
        { id: 'm3', achievedAt: new Date('2025-02-05') },
      ];
      masteryRecordRepo.find.mockResolvedValue(records);

      const result = await service.getSkillVelocity(tenantId, {
        granularity: AnalyticsGranularity.MONTH,
        from: '2025-01-01',
        to: '2025-03-01',
      });

      expect(result.totalMasteries).toBe(3);
      expect(result.data).toHaveLength(2);
      const jan = result.data.find((d) => d.period === '2025-01');
      expect(jan!.masteryCount).toBe(2);
      const feb = result.data.find((d) => d.period === '2025-02');
      expect(feb!.masteryCount).toBe(1);
    });
  });

  describe('getProgramStats', () => {
    it('returns correct program stats', async () => {
      programRepo.findOne.mockResolvedValue({ id: programId, name: 'Full Stack' });
      enrollmentRepo.find.mockResolvedValue([
        { id: 'e1', status: EnrollmentStatus.ACTIVE },
        { id: 'e2', status: EnrollmentStatus.COMPLETED },
        { id: 'e3', status: EnrollmentStatus.COMPLETED },
        { id: 'e4', status: EnrollmentStatus.WITHDRAWN },
        { id: 'e5', status: EnrollmentStatus.PENDING },
      ]);
      cohortRepo.count.mockResolvedValue(3);

      const result = await service.getProgramStats(tenantId, programId);

      expect(result.programId).toBe(programId);
      expect(result.programName).toBe('Full Stack');
      expect(result.totalEnrolled).toBe(5);
      expect(result.active).toBe(1);
      expect(result.completed).toBe(2);
      expect(result.withdrawn).toBe(1);
      expect(result.pending).toBe(1);
      expect(result.completionRate).toBe(40);
      expect(result.cohortCount).toBe(3);
    });

    it('throws NotFoundException for unknown program', async () => {
      programRepo.findOne.mockResolvedValue(null);

      await expect(service.getProgramStats(tenantId, 'nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
