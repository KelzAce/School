import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StudentProfile, StudentStatus } from '../students/entities/student-profile.entity.js';
import { Enrollment, EnrollmentStatus } from '../students/entities/enrollment.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { CompetencyAssessment, AssessmentResult } from '../competency/entities/competency-assessment.entity.js';
import { Portfolio, PortfolioStatus } from '../assessments/entities/portfolio.entity.js';
import { PortfolioAssessment, PortfolioAssessmentStatus } from '../assessments/entities/portfolio-assessment.entity.js';
import { WorkplacePlacement, PlacementStatus } from '../workplace/entities/workplace-placement.entity.js';
import { WorkplaceLog } from '../workplace/entities/workplace-log.entity.js';
import { RiskLevel, RetentionQueryDto } from './dto/index.js';

export interface RiskFactor {
  signal: string;
  description: string;
  points: number;
}

export interface RetentionAlert {
  studentProfileId: string;
  studentNumber?: string;
  userId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendations: string[];
  computedAt: string;
}

export interface RetentionSummary {
  totalActiveStudents: number;
  none:     number;
  low:      number;
  medium:   number;
  high:     number;
  critical: number;
  computedAt: string;
}

interface StudentRawData {
  masteryRecords:       MasteryRecord[];
  enrollments:          Enrollment[];
  assessments:          CompetencyAssessment[];
  portfolios:           Portfolio[];
  portfolioAssessments: PortfolioAssessment[];
  placements:           WorkplacePlacement[];
  workplaceLogs:        WorkplaceLog[];
}

function daysSince(date: Date | string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function scoreToLevel(score: number): RiskLevel {
  if (score === 0) return RiskLevel.NONE;
  if (score < 25) return RiskLevel.LOW;
  if (score < 50) return RiskLevel.MEDIUM;
  if (score < 75) return RiskLevel.HIGH;
  return RiskLevel.CRITICAL;
}

function levelToMinScore(level: RiskLevel): number {
  switch (level) {
    case RiskLevel.NONE:     return 0;
    case RiskLevel.LOW:      return 1;
    case RiskLevel.MEDIUM:   return 25;
    case RiskLevel.HIGH:     return 50;
    case RiskLevel.CRITICAL: return 75;
  }
}

function buildRecommendations(riskFactors: RiskFactor[]): string[] {
  const map: Record<string, string> = {
    NO_RECENT_MASTERY:       'Schedule a 1-on-1 check-in to review skill progression',
    HIGH_FAILURE_RATE:       'Consider additional tutoring or assessment support',
    LOW_SKILL_VELOCITY:      'Review learning pace and adjust course load or support',
    NO_PORTFOLIO_SUBMISSION: 'Prompt student to submit portfolio work for review',
    LOW_PORTFOLIO_SCORE:     'Provide targeted feedback on portfolio quality and rubric criteria',
    PLACEMENT_TERMINATED:    'Investigate placement issues and explore alternative placements',
    INACTIVE_WORKPLACE_LOGS: 'Contact student and supervisor to resume workplace log submissions',
    STALE_ENROLLMENT:        'Process pending enrolment application urgently',
    REPEATED_FAILURES:       'Urgently review student support plan and consider intervention',
  };
  return riskFactors.map(f => map[f.signal]).filter(Boolean);
}

@Injectable()
export class RetentionService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepo: Repository<StudentProfile>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(MasteryRecord)
    private readonly masteryRecordRepo: Repository<MasteryRecord>,
    @InjectRepository(CompetencyAssessment)
    private readonly competencyAssessmentRepo: Repository<CompetencyAssessment>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
    @InjectRepository(PortfolioAssessment)
    private readonly portfolioAssessmentRepo: Repository<PortfolioAssessment>,
    @InjectRepository(WorkplacePlacement)
    private readonly workplacePlacementRepo: Repository<WorkplacePlacement>,
    @InjectRepository(WorkplaceLog)
    private readonly workplaceLogRepo: Repository<WorkplaceLog>,
  ) {}

  computeAlert(tenantId: string, student: StudentProfile, data: StudentRawData): RetentionAlert {
    const now = new Date();
    const riskFactors: RiskFactor[] = [];
    let score = 0;

    const enrollmentAge = student.enrollmentDate ? daysSince(student.enrollmentDate) : 0;

    // SIGNAL 1: NO_RECENT_MASTERY
    if (enrollmentAge >= 30) {
      const recentMasteries = data.masteryRecords.filter(m => daysSince(m.achievedAt) <= 30);
      if (recentMasteries.length === 0) {
        score += 25;
        riskFactors.push({ signal: 'NO_RECENT_MASTERY', description: 'No skills mastered in the last 30 days', points: 25 });
      }
    }

    // SIGNAL 2: HIGH_FAILURE_RATE
    const recentAssessments = data.assessments.filter(a => daysSince(a.assessedAt) <= 30);
    if (recentAssessments.length >= 2) {
      const failCount = recentAssessments.filter(a => a.result === AssessmentResult.NOT_YET_COMPETENT).length;
      if (failCount / recentAssessments.length >= 0.5) {
        score += 20;
        riskFactors.push({ signal: 'HIGH_FAILURE_RATE', description: `${failCount} of ${recentAssessments.length} recent assessments were not yet competent`, points: 20 });
      }
    }

    // SIGNAL 3: LOW_SKILL_VELOCITY
    if (enrollmentAge >= 60) {
      const last90 = data.masteryRecords.filter(m => daysSince(m.achievedAt) <= 90);
      if (last90.length < 3) {
        score += 15;
        riskFactors.push({ signal: 'LOW_SKILL_VELOCITY', description: `Only ${last90.length} mastery events in the last 90 days (target: ≥3)`, points: 15 });
      }
    }

    // SIGNAL 4: NO_PORTFOLIO_SUBMISSION
    if (enrollmentAge >= 60) {
      const activePortfolios = data.portfolios.filter(p =>
        [PortfolioStatus.SUBMITTED, PortfolioStatus.UNDER_REVIEW, PortfolioStatus.REVIEWED].includes(p.status),
      );
      if (activePortfolios.length === 0) {
        score += 15;
        riskFactors.push({ signal: 'NO_PORTFOLIO_SUBMISSION', description: 'No portfolios submitted in over 60 days of enrolment', points: 15 });
      }
    }

    // SIGNAL 5: LOW_PORTFOLIO_SCORE
    const completedAssessments = data.portfolioAssessments
      .filter(pa => pa.status === PortfolioAssessmentStatus.COMPLETED && pa.scorePercentage !== null)
      .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime());
    if (completedAssessments.length > 0 && Number(completedAssessments[0].scorePercentage) < 60) {
      score += 20;
      riskFactors.push({ signal: 'LOW_PORTFOLIO_SCORE', description: `Most recent portfolio scored ${completedAssessments[0].scorePercentage}% (threshold: 60%)`, points: 20 });
    }

    // SIGNAL 6: PLACEMENT_TERMINATED
    const terminatedPlacements = data.placements.filter(p =>
      p.status === PlacementStatus.TERMINATED || p.status === PlacementStatus.DEFERRED,
    );
    if (terminatedPlacements.length > 0) {
      score += 20;
      riskFactors.push({ signal: 'PLACEMENT_TERMINATED', description: `${terminatedPlacements.length} workplace placement(s) terminated or deferred`, points: 20 });
    }

    // SIGNAL 7: INACTIVE_WORKPLACE_LOGS
    const activePlacements = data.placements.filter(p => p.status === PlacementStatus.ACTIVE);
    if (activePlacements.length > 0) {
      const recentLogs = data.workplaceLogs.filter(l => daysSince(l.logDate) <= 14);
      if (recentLogs.length === 0) {
        score += 15;
        riskFactors.push({ signal: 'INACTIVE_WORKPLACE_LOGS', description: 'Active workplace placement but no training logs in the last 14 days', points: 15 });
      }
    }

    // SIGNAL 8: STALE_ENROLLMENT
    const staleEnrollments = data.enrollments.filter(e =>
      (e.status === EnrollmentStatus.PENDING || e.status === EnrollmentStatus.APPROVED) &&
      daysSince(e.appliedAt) > 30,
    );
    if (staleEnrollments.length > 0) {
      score += 10;
      riskFactors.push({ signal: 'STALE_ENROLLMENT', description: `${staleEnrollments.length} enrolment(s) pending/awaiting approval for over 30 days`, points: 10 });
    }

    // SIGNAL 9: REPEATED_FAILURES
    const recentFailures = data.assessments.filter(a =>
      daysSince(a.assessedAt) <= 30 && a.result === AssessmentResult.NOT_YET_COMPETENT,
    );
    if (recentFailures.length >= 3) {
      score += 25;
      riskFactors.push({ signal: 'REPEATED_FAILURES', description: `${recentFailures.length} competency assessments failed in the last 30 days`, points: 25 });
    }

    const recommendations = buildRecommendations(riskFactors);

    return {
      studentProfileId: student.id,
      studentNumber: student.studentNumber,
      userId: student.userId,
      riskScore: score,
      riskLevel: scoreToLevel(score),
      riskFactors,
      recommendations,
      computedAt: now.toISOString(),
    };
  }

  async getAlerts(tenantId: string, query: RetentionQueryDto): Promise<RetentionAlert[]> {
    const students = await this.studentProfileRepo.find({
      where: { tenantId, status: StudentStatus.ENROLLED },
    });

    if (students.length === 0) return [];

    // Batch load all data for the tenant
    const [
      enrollments,
      masteryRecords,
      assessments,
      portfolios,
      placements,
      workplaceLogs,
    ] = await Promise.all([
      this.enrollmentRepo.find({ where: { tenantId } }),
      this.masteryRecordRepo.find({ where: { tenantId } }),
      this.competencyAssessmentRepo.find({ where: { tenantId } }),
      this.portfolioRepo.find({ where: { tenantId } }),
      this.workplacePlacementRepo.find({ where: { tenantId } }),
      this.workplaceLogRepo.find({ where: { tenantId } }),
    ]);

    // Load portfolio assessments via portfolio IDs
    let portfolioAssessments: PortfolioAssessment[] = [];
    if (portfolios.length > 0) {
      const portfolioIds = portfolios.map(p => p.id);
      portfolioAssessments = await this.portfolioAssessmentRepo.find({
        where: { tenantId, portfolioId: In(portfolioIds) },
      });
    }

    // Group by studentProfileId using Maps
    const enrollmentsByStudent = new Map<string, Enrollment[]>();
    const masteryByStudent = new Map<string, MasteryRecord[]>();
    const assessmentsByStudent = new Map<string, CompetencyAssessment[]>();
    const portfoliosByStudent = new Map<string, Portfolio[]>();
    const placementsByStudent = new Map<string, WorkplacePlacement[]>();
    const logsByStudent = new Map<string, WorkplaceLog[]>();

    for (const e of enrollments) {
      const arr = enrollmentsByStudent.get(e.studentProfileId) ?? [];
      arr.push(e);
      enrollmentsByStudent.set(e.studentProfileId, arr);
    }
    for (const m of masteryRecords) {
      const arr = masteryByStudent.get(m.studentProfileId) ?? [];
      arr.push(m);
      masteryByStudent.set(m.studentProfileId, arr);
    }
    for (const a of assessments) {
      const arr = assessmentsByStudent.get(a.studentProfileId) ?? [];
      arr.push(a);
      assessmentsByStudent.set(a.studentProfileId, arr);
    }
    for (const p of portfolios) {
      const arr = portfoliosByStudent.get(p.studentProfileId) ?? [];
      arr.push(p);
      portfoliosByStudent.set(p.studentProfileId, arr);
    }
    for (const pl of placements) {
      const arr = placementsByStudent.get(pl.studentProfileId) ?? [];
      arr.push(pl);
      placementsByStudent.set(pl.studentProfileId, arr);
    }
    for (const l of workplaceLogs) {
      const arr = logsByStudent.get(l.studentProfileId) ?? [];
      arr.push(l);
      logsByStudent.set(l.studentProfileId, arr);
    }

    // Build portfolioId -> studentProfileId map for portfolio assessments
    const portfolioIdToStudentId = new Map<string, string>();
    for (const p of portfolios) {
      portfolioIdToStudentId.set(p.id, p.studentProfileId);
    }
    const paByStudent = new Map<string, PortfolioAssessment[]>();
    for (const pa of portfolioAssessments) {
      const studentId = portfolioIdToStudentId.get(pa.portfolioId);
      if (studentId) {
        const arr = paByStudent.get(studentId) ?? [];
        arr.push(pa);
        paByStudent.set(studentId, arr);
      }
    }

    // Compute alerts
    const alerts: RetentionAlert[] = [];
    for (const student of students) {
      const data: StudentRawData = {
        enrollments:          enrollmentsByStudent.get(student.id) ?? [],
        masteryRecords:       masteryByStudent.get(student.id) ?? [],
        assessments:          assessmentsByStudent.get(student.id) ?? [],
        portfolios:           portfoliosByStudent.get(student.id) ?? [],
        portfolioAssessments: paByStudent.get(student.id) ?? [],
        placements:           placementsByStudent.get(student.id) ?? [],
        workplaceLogs:        logsByStudent.get(student.id) ?? [],
      };
      const alert = this.computeAlert(tenantId, student, data);
      if (alert.riskLevel !== RiskLevel.NONE) {
        alerts.push(alert);
      }
    }

    // Filter by minRiskLevel
    let filtered = alerts;
    if (query.minRiskLevel) {
      const minScore = levelToMinScore(query.minRiskLevel);
      filtered = alerts.filter(a => a.riskScore >= minScore);
    }

    // Sort by riskScore DESC and limit
    filtered.sort((a, b) => b.riskScore - a.riskScore);
    return filtered.slice(0, query.limit ?? 50);
  }

  async getStudentAlert(tenantId: string, studentProfileId: string): Promise<RetentionAlert> {
    const student = await this.studentProfileRepo.findOne({
      where: { id: studentProfileId, tenantId },
    });

    if (!student || student.status !== StudentStatus.ENROLLED) {
      throw new NotFoundException(`Student profile ${studentProfileId} not found or not active`);
    }

    // Load student-specific data
    const portfolios = await this.portfolioRepo.find({
      where: { tenantId, studentProfileId },
    });

    let portfolioAssessments: PortfolioAssessment[] = [];
    if (portfolios.length > 0) {
      const portfolioIds = portfolios.map(p => p.id);
      portfolioAssessments = await this.portfolioAssessmentRepo.find({
        where: { tenantId, portfolioId: In(portfolioIds) },
      });
    }

    const [enrollments, masteryRecords, assessments, placements, workplaceLogs] = await Promise.all([
      this.enrollmentRepo.find({ where: { tenantId, studentProfileId } }),
      this.masteryRecordRepo.find({ where: { tenantId, studentProfileId } }),
      this.competencyAssessmentRepo.find({ where: { tenantId, studentProfileId } }),
      this.workplacePlacementRepo.find({ where: { tenantId, studentProfileId } }),
      this.workplaceLogRepo.find({ where: { tenantId, studentProfileId } }),
    ]);

    const data: StudentRawData = {
      enrollments,
      masteryRecords,
      assessments,
      portfolios,
      portfolioAssessments,
      placements,
      workplaceLogs,
    };

    return this.computeAlert(tenantId, student, data);
  }

  async getSummary(tenantId: string): Promise<RetentionSummary> {
    const [allAlerts, totalActiveStudents] = await Promise.all([
      this.getAlerts(tenantId, { limit: 1000 }),
      this.studentProfileRepo.count({ where: { tenantId, status: StudentStatus.ENROLLED } }),
    ]);

    const counts = { none: 0, low: 0, medium: 0, high: 0, critical: 0 };
    for (const alert of allAlerts) {
      counts[alert.riskLevel]++;
    }

    return {
      totalActiveStudents,
      ...counts,
      computedAt: new Date().toISOString(),
    };
  }
}
