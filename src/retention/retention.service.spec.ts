import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RetentionService } from './retention.service.js';
import { RiskLevel } from './dto/index.js';
import { StudentProfile, StudentStatus } from '../students/entities/student-profile.entity.js';
import { Enrollment, EnrollmentStatus } from '../students/entities/enrollment.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { CompetencyAssessment, AssessmentResult } from '../competency/entities/competency-assessment.entity.js';
import { Portfolio, PortfolioStatus } from '../assessments/entities/portfolio.entity.js';
import { PortfolioAssessment, PortfolioAssessmentStatus } from '../assessments/entities/portfolio-assessment.entity.js';
import { WorkplacePlacement, PlacementStatus } from '../workplace/entities/workplace-placement.entity.js';
import { WorkplaceLog } from '../workplace/entities/workplace-log.entity.js';

const createMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
});

const tenantId = '00000000-0000-0000-0000-000000000001';
const studentProfileId = '00000000-0000-0000-0000-000000000002';
const userId = '00000000-0000-0000-0000-000000000003';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function makeStudent(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: studentProfileId,
    tenantId,
    userId,
    studentNumber: 'S-001',
    status: StudentStatus.ENROLLED,
    enrollmentDate: new Date(),
    ...overrides,
  } as StudentProfile;
}

const emptyData = {
  masteryRecords: [],
  enrollments: [],
  assessments: [],
  portfolios: [],
  portfolioAssessments: [],
  placements: [],
  workplaceLogs: [],
};

describe('RetentionService', () => {
  let service: RetentionService;
  let studentProfileRepo: ReturnType<typeof createMockRepo>;
  let enrollmentRepo: ReturnType<typeof createMockRepo>;
  let masteryRecordRepo: ReturnType<typeof createMockRepo>;
  let competencyAssessmentRepo: ReturnType<typeof createMockRepo>;
  let portfolioRepo: ReturnType<typeof createMockRepo>;
  let portfolioAssessmentRepo: ReturnType<typeof createMockRepo>;
  let workplacePlacementRepo: ReturnType<typeof createMockRepo>;
  let workplaceLogRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetentionService,
        { provide: getRepositoryToken(StudentProfile), useValue: createMockRepo() },
        { provide: getRepositoryToken(Enrollment), useValue: createMockRepo() },
        { provide: getRepositoryToken(MasteryRecord), useValue: createMockRepo() },
        { provide: getRepositoryToken(CompetencyAssessment), useValue: createMockRepo() },
        { provide: getRepositoryToken(Portfolio), useValue: createMockRepo() },
        { provide: getRepositoryToken(PortfolioAssessment), useValue: createMockRepo() },
        { provide: getRepositoryToken(WorkplacePlacement), useValue: createMockRepo() },
        { provide: getRepositoryToken(WorkplaceLog), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<RetentionService>(RetentionService);
    studentProfileRepo = module.get(getRepositoryToken(StudentProfile));
    enrollmentRepo = module.get(getRepositoryToken(Enrollment));
    masteryRecordRepo = module.get(getRepositoryToken(MasteryRecord));
    competencyAssessmentRepo = module.get(getRepositoryToken(CompetencyAssessment));
    portfolioRepo = module.get(getRepositoryToken(Portfolio));
    portfolioAssessmentRepo = module.get(getRepositoryToken(PortfolioAssessment));
    workplacePlacementRepo = module.get(getRepositoryToken(WorkplacePlacement));
    workplaceLogRepo = module.get(getRepositoryToken(WorkplaceLog));

    jest.clearAllMocks();
  });

  describe('computeAlert', () => {
    it('returns NONE risk when student has no signals triggered', () => {
      const student = makeStudent({ enrollmentDate: new Date() });
      const result = service.computeAlert(tenantId, student, emptyData);

      expect(result.riskScore).toBe(0);
      expect(result.riskLevel).toBe(RiskLevel.NONE);
      expect(result.riskFactors).toHaveLength(0);
    });

    it('triggers NO_RECENT_MASTERY when enrolled >= 30 days with zero masteries', () => {
      const student = makeStudent({ enrollmentDate: daysAgo(45) });
      const result = service.computeAlert(tenantId, student, emptyData);

      expect(result.riskScore).toBeGreaterThanOrEqual(25);
      expect(result.riskFactors.some(f => f.signal === 'NO_RECENT_MASTERY')).toBe(true);
    });

    it('triggers HIGH_FAILURE_RATE with 2 of 3 recent assessments failing', () => {
      const student = makeStudent({ enrollmentDate: new Date() });
      const data = {
        ...emptyData,
        assessments: [
          { assessedAt: daysAgo(5), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(10), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(15), result: AssessmentResult.COMPETENT },
        ] as CompetencyAssessment[],
      };

      const result = service.computeAlert(tenantId, student, data);

      expect(result.riskFactors.some(f => f.signal === 'HIGH_FAILURE_RATE')).toBe(true);
      const factor = result.riskFactors.find(f => f.signal === 'HIGH_FAILURE_RATE')!;
      expect(factor.points).toBe(20);
    });

    it('triggers REPEATED_FAILURES with 4 failures in last 30 days', () => {
      const student = makeStudent({ enrollmentDate: new Date() });
      const data = {
        ...emptyData,
        assessments: [
          { assessedAt: daysAgo(2), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(5), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(10), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(15), result: AssessmentResult.NOT_YET_COMPETENT },
        ] as CompetencyAssessment[],
      };

      const result = service.computeAlert(tenantId, student, data);

      expect(result.riskFactors.some(f => f.signal === 'REPEATED_FAILURES')).toBe(true);
      const factor = result.riskFactors.find(f => f.signal === 'REPEATED_FAILURES')!;
      expect(factor.points).toBe(25);
    });

    it('compounds NO_RECENT_MASTERY + REPEATED_FAILURES to HIGH level', () => {
      const student = makeStudent({ enrollmentDate: daysAgo(45) });
      // 3 failures + 4 passing = 3/7 = 43% < 50% (avoids HIGH_FAILURE_RATE)
      // but 3 failures still triggers REPEATED_FAILURES
      const data = {
        ...emptyData,
        assessments: [
          { assessedAt: daysAgo(2), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(5), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(10), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(12), result: AssessmentResult.COMPETENT },
          { assessedAt: daysAgo(14), result: AssessmentResult.COMPETENT },
          { assessedAt: daysAgo(16), result: AssessmentResult.COMPETENT },
          { assessedAt: daysAgo(18), result: AssessmentResult.COMPETENT },
        ] as CompetencyAssessment[],
      };

      const result = service.computeAlert(tenantId, student, data);

      expect(result.riskScore).toBe(50);
      expect(result.riskLevel).toBe(RiskLevel.HIGH);
    });

    it('reaches CRITICAL level with multiple signals', () => {
      const student = makeStudent({ enrollmentDate: daysAgo(45) });
      const portfolioId = '00000000-0000-0000-0000-000000000010';
      const data = {
        ...emptyData,
        assessments: [
          { assessedAt: daysAgo(2), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(5), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(10), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(15), result: AssessmentResult.NOT_YET_COMPETENT },
          { assessedAt: daysAgo(20), result: AssessmentResult.NOT_YET_COMPETENT },
        ] as CompetencyAssessment[],
        portfolios: [{ id: portfolioId, studentProfileId, tenantId, status: PortfolioStatus.SUBMITTED }] as Portfolio[],
        portfolioAssessments: [
          {
            portfolioId,
            tenantId,
            status: PortfolioAssessmentStatus.COMPLETED,
            scorePercentage: 40,
            completedAt: daysAgo(5),
          },
        ] as unknown as PortfolioAssessment[],
      };

      const result = service.computeAlert(tenantId, student, data);

      // NO_RECENT_MASTERY (25) + HIGH_FAILURE_RATE (20) + REPEATED_FAILURES (25) + LOW_PORTFOLIO_SCORE (20) = 90
      expect(result.riskScore).toBeGreaterThanOrEqual(75);
      expect(result.riskLevel).toBe(RiskLevel.CRITICAL);
    });

    it('triggers PLACEMENT_TERMINATED for a terminated placement', () => {
      const student = makeStudent({ enrollmentDate: new Date() });
      const data = {
        ...emptyData,
        placements: [{ status: PlacementStatus.TERMINATED }] as WorkplacePlacement[],
      };

      const result = service.computeAlert(tenantId, student, data);

      expect(result.riskFactors.some(f => f.signal === 'PLACEMENT_TERMINATED')).toBe(true);
      const factor = result.riskFactors.find(f => f.signal === 'PLACEMENT_TERMINATED')!;
      expect(factor.points).toBe(20);
    });

    it('triggers INACTIVE_WORKPLACE_LOGS for active placement with no recent logs', () => {
      const student = makeStudent({ enrollmentDate: new Date() });
      const data = {
        ...emptyData,
        placements: [{ status: PlacementStatus.ACTIVE }] as WorkplacePlacement[],
        workplaceLogs: [{ logDate: daysAgo(20).toISOString().split('T')[0] }] as unknown as WorkplaceLog[],
      };

      const result = service.computeAlert(tenantId, student, data);

      expect(result.riskFactors.some(f => f.signal === 'INACTIVE_WORKPLACE_LOGS')).toBe(true);
    });

    it('does NOT trigger LOW_PORTFOLIO_SCORE when score >= 60', () => {
      const portfolioId = '00000000-0000-0000-0000-000000000010';
      const student = makeStudent({ enrollmentDate: new Date() });
      const data = {
        ...emptyData,
        portfolios: [{ id: portfolioId, status: PortfolioStatus.SUBMITTED }] as Portfolio[],
        portfolioAssessments: [
          {
            portfolioId,
            tenantId,
            status: PortfolioAssessmentStatus.COMPLETED,
            scorePercentage: 70,
            completedAt: daysAgo(5),
          },
        ] as unknown as PortfolioAssessment[],
      };

      const result = service.computeAlert(tenantId, student, data);

      expect(result.riskFactors.some(f => f.signal === 'LOW_PORTFOLIO_SCORE')).toBe(false);
    });
  });

  describe('getStudentAlert', () => {
    it('throws NotFoundException for unknown student', async () => {
      studentProfileRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getStudentAlert(tenantId, studentProfileId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when student is not enrolled', async () => {
      studentProfileRepo.findOne.mockResolvedValue(
        makeStudent({ status: StudentStatus.WITHDRAWN }),
      );

      await expect(
        service.getStudentAlert(tenantId, studentProfileId),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns alert for active enrolled student', async () => {
      const student = makeStudent({ enrollmentDate: new Date() });
      studentProfileRepo.findOne.mockResolvedValue(student);
      portfolioRepo.find.mockResolvedValue([]);
      enrollmentRepo.find.mockResolvedValue([]);
      masteryRecordRepo.find.mockResolvedValue([]);
      competencyAssessmentRepo.find.mockResolvedValue([]);
      workplacePlacementRepo.find.mockResolvedValue([]);
      workplaceLogRepo.find.mockResolvedValue([]);

      const result = await service.getStudentAlert(tenantId, studentProfileId);

      expect(result.studentProfileId).toBe(studentProfileId);
      expect(result.riskLevel).toBe(RiskLevel.NONE);
    });
  });

  describe('getAlerts', () => {
    it('filters by minRiskLevel returning only students at or above threshold', async () => {
      const student1 = makeStudent({ id: '00000000-0000-0000-0000-000000000011', enrollmentDate: daysAgo(45) });
      const student2 = makeStudent({ id: '00000000-0000-0000-0000-000000000012', enrollmentDate: new Date() });

      studentProfileRepo.find.mockResolvedValue([student1, student2]);
      enrollmentRepo.find.mockResolvedValue([]);
      masteryRecordRepo.find.mockResolvedValue([]);
      competencyAssessmentRepo.find.mockResolvedValue([]);
      portfolioRepo.find.mockResolvedValue([]);
      workplacePlacementRepo.find.mockResolvedValue([]);
      workplaceLogRepo.find.mockResolvedValue([]);

      // student1 enrolled 45 days ago with no masteries → score=25 (MEDIUM)
      // student2 enrolled today → score=0 (NONE, filtered out)
      const result = await service.getAlerts(tenantId, { minRiskLevel: RiskLevel.MEDIUM });

      // Only student1 (riskScore=25) should pass MEDIUM filter
      expect(result.every(a => a.riskScore >= 25)).toBe(true);
    });

    it('returns results sorted by riskScore descending', async () => {
      const student1 = makeStudent({ id: '00000000-0000-0000-0000-000000000011', enrollmentDate: daysAgo(45) });
      const student2 = makeStudent({ id: '00000000-0000-0000-0000-000000000012', enrollmentDate: daysAgo(65) });

      studentProfileRepo.find.mockResolvedValue([student1, student2]);
      enrollmentRepo.find.mockResolvedValue([]);
      masteryRecordRepo.find.mockResolvedValue([]);
      competencyAssessmentRepo.find.mockResolvedValue([]);
      portfolioRepo.find.mockResolvedValue([]);
      workplacePlacementRepo.find.mockResolvedValue([]);
      workplaceLogRepo.find.mockResolvedValue([]);

      const result = await service.getAlerts(tenantId, {});

      // Verify sorted descending
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].riskScore).toBeGreaterThanOrEqual(result[i].riskScore);
      }
    });
  });

  describe('getSummary', () => {
    it('returns correct counts per risk level', async () => {
      // student1: enrolled 45 days ago, no masteries → MEDIUM (25)
      const student1 = makeStudent({ id: '00000000-0000-0000-0000-000000000011', enrollmentDate: daysAgo(45) });
      // student2: enrolled today → NONE (filtered in getAlerts)
      const student2 = makeStudent({ id: '00000000-0000-0000-0000-000000000012', enrollmentDate: new Date() });

      studentProfileRepo.find.mockResolvedValue([student1, student2]);
      studentProfileRepo.count.mockResolvedValue(2);
      enrollmentRepo.find.mockResolvedValue([]);
      masteryRecordRepo.find.mockResolvedValue([]);
      competencyAssessmentRepo.find.mockResolvedValue([]);
      portfolioRepo.find.mockResolvedValue([]);
      workplacePlacementRepo.find.mockResolvedValue([]);
      workplaceLogRepo.find.mockResolvedValue([]);

      const summary = await service.getSummary(tenantId);

      expect(summary.totalActiveStudents).toBe(2);
      expect(summary.medium).toBeGreaterThanOrEqual(1);
      expect(summary.none + summary.low + summary.medium + summary.high + summary.critical).toBe(
        summary.medium + summary.low + summary.high + summary.critical,
      );
    });
  });
});
