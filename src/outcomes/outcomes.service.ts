import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile, StudentStatus } from '../students/entities/student-profile.entity.js';
import { Enrollment, EnrollmentStatus } from '../students/entities/enrollment.entity.js';
import { WorkplacePlacement, PlacementStatus, PlacementType } from '../workplace/entities/workplace-placement.entity.js';
import { OpportunityApplication, ApplicationStatus } from '../industry/entities/opportunity-application.entity.js';
import { IssuedBadge, BadgeStatus } from '../badges/entities/issued-badge.entity.js';
import { MicroCredential, CredentialStatus } from '../badges/entities/micro-credential.entity.js';
import { OutcomesQueryDto } from './dto/index.js';

export interface OutcomeOverview {
  totalStudents: number;
  graduates: number;
  graduationRate: number;
  activeEnrollments: number;
  completedEnrollments: number;
  acceptedApplications: number;
  completedPlacements: number;
  activePlacements: number;
  issuedBadges: number;
  activeMicroCredentials: number;
  computedAt: string;
}

export interface GraduateReport {
  totalGraduates: number;
  byLearningTrack: Record<string, number>;
  byMonth: Array<{ month: string; count: number }>;
  completionsByProgram: Array<{
    programId: string;
    completedCount: number;
    withdrawnCount: number;
    activeCount: number;
  }>;
  computedAt: string;
}

export interface EmploymentReport {
  totalAccepted: number;
  totalShortlisted: number;
  applicationsByStatus: Record<string, number>;
  completedPlacements: number;
  activePlacements: number;
  terminatedPlacements: number;
  placementsByType: Record<string, number>;
  employmentRate: number;
  computedAt: string;
}

export interface CredentialReport {
  totalIssuedBadges: number;
  revokedBadges: number;
  activeMicroCredentials: number;
  revokedMicroCredentials: number;
  badgesIssuedByMonth: Array<{ month: string; count: number }>;
  credentialsIssuedByMonth: Array<{ month: string; count: number }>;
  studentsWithCredentials: number;
  studentsWithJobAfterCredential: number;
  credentialToJobConversionRate: number;
  computedAt: string;
}

@Injectable()
export class OutcomesService {
  constructor(
    @InjectRepository(StudentProfile) private readonly studentProfileRepo: Repository<StudentProfile>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(WorkplacePlacement) private readonly placementRepo: Repository<WorkplacePlacement>,
    @InjectRepository(OpportunityApplication) private readonly applicationRepo: Repository<OpportunityApplication>,
    @InjectRepository(IssuedBadge) private readonly badgeRepo: Repository<IssuedBadge>,
    @InjectRepository(MicroCredential) private readonly credentialRepo: Repository<MicroCredential>,
  ) {}

  private applyDateFilter<T extends { createdAt?: Date; issuedAt?: Date; completedAt?: Date | null; appliedAt?: Date; enrollmentDate?: Date | null }>(
    items: T[], from?: string, to?: string, dateField: keyof T = 'createdAt' as keyof T,
  ): T[] {
    return items.filter(item => {
      const d = item[dateField] as Date | string | null;
      if (!d) return true;
      const dt = new Date(d as string | Date).getTime();
      if (from && dt < new Date(from).getTime()) return false;
      if (to && dt > new Date(to + 'T23:59:59Z').getTime()) return false;
      return true;
    });
  }

  private groupByMonth(items: Array<{ date: Date | string | null }>): Array<{ month: string; count: number }> {
    const map = new Map<string, number>();
    for (const item of items) {
      if (!item.date) continue;
      const month = new Date(item.date as string | Date).toISOString().slice(0, 7);
      map.set(month, (map.get(month) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getOverview(tenantId: string, query: OutcomesQueryDto): Promise<OutcomeOverview> {
    const [students, enrollments, applications, placements, badges, credentials] = await Promise.all([
      this.studentProfileRepo.find({ where: { tenantId } }),
      this.enrollmentRepo.find({ where: { tenantId } }),
      this.applicationRepo.find({ where: { tenantId } }),
      this.placementRepo.find({ where: { tenantId } }),
      this.badgeRepo.find({ where: { tenantId } }),
      this.credentialRepo.find({ where: { tenantId } }),
    ]);

    const totalStudents = students.length;
    const graduates = students.filter(s => s.status === StudentStatus.GRADUATED).length;
    const graduationRate = totalStudents === 0 ? 0 : (graduates / totalStudents) * 100;

    const activeEnrollments = enrollments.filter(e => e.status === EnrollmentStatus.ACTIVE).length;

    const filteredCompletedEnrollments = this.applyDateFilter(enrollments, query.from, query.to, 'completedAt' as keyof Enrollment);
    const completedEnrollments = filteredCompletedEnrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length;

    const filteredApplications = this.applyDateFilter(applications, query.from, query.to, 'createdAt' as keyof OpportunityApplication);
    const acceptedApplications = filteredApplications.filter(a => a.status === ApplicationStatus.ACCEPTED).length;

    const filteredCompletedPlacements = this.applyDateFilter(placements, query.from, query.to, 'completedAt' as keyof WorkplacePlacement);
    const completedPlacements = filteredCompletedPlacements.filter(p => p.status === PlacementStatus.COMPLETED).length;

    const activePlacements = placements.filter(p => p.status === PlacementStatus.ACTIVE).length;

    const filteredBadges = this.applyDateFilter(badges, query.from, query.to, 'issuedAt' as keyof IssuedBadge);
    const issuedBadges = filteredBadges.filter(b => b.status === BadgeStatus.ISSUED).length;

    const filteredCredentials = this.applyDateFilter(credentials, query.from, query.to, 'issuedAt' as keyof MicroCredential);
    const activeMicroCredentials = filteredCredentials.filter(c => c.status === CredentialStatus.ACTIVE).length;

    return {
      totalStudents,
      graduates,
      graduationRate,
      activeEnrollments,
      completedEnrollments,
      acceptedApplications,
      completedPlacements,
      activePlacements,
      issuedBadges,
      activeMicroCredentials,
      computedAt: new Date().toISOString(),
    };
  }

  async getGraduateReport(tenantId: string, query: OutcomesQueryDto): Promise<GraduateReport> {
    const [students, enrollments] = await Promise.all([
      this.studentProfileRepo.find({ where: { tenantId } }),
      this.enrollmentRepo.find({ where: { tenantId } }),
    ]);

    let graduates = students.filter(s => s.status === StudentStatus.GRADUATED);
    if (query.from || query.to) {
      graduates = this.applyDateFilter(graduates, query.from, query.to, 'enrollmentDate' as keyof StudentProfile);
    }

    const byLearningTrack: Record<string, number> = {};
    for (const s of graduates) {
      const track = s.learningTrack ?? 'General';
      byLearningTrack[track] = (byLearningTrack[track] ?? 0) + 1;
    }

    const byMonth = this.groupByMonth(
      graduates.map(s => ({ date: s.enrollmentDate })),
    );

    // completionsByProgram: group enrollments by programId and status
    const programMap = new Map<string, { completedCount: number; withdrawnCount: number; activeCount: number }>();
    for (const e of enrollments) {
      if (!programMap.has(e.programId)) {
        programMap.set(e.programId, { completedCount: 0, withdrawnCount: 0, activeCount: 0 });
      }
      const entry = programMap.get(e.programId)!;
      if (e.status === EnrollmentStatus.COMPLETED) entry.completedCount++;
      else if (e.status === EnrollmentStatus.WITHDRAWN) entry.withdrawnCount++;
      else if (e.status === EnrollmentStatus.ACTIVE) entry.activeCount++;
    }

    const completionsByProgram = Array.from(programMap.entries()).map(([programId, counts]) => ({
      programId,
      ...counts,
    }));

    return {
      totalGraduates: graduates.length,
      byLearningTrack,
      byMonth,
      completionsByProgram,
      computedAt: new Date().toISOString(),
    };
  }

  async getEmploymentReport(tenantId: string, query: OutcomesQueryDto): Promise<EmploymentReport> {
    const [applications, placements, students, enrollments] = await Promise.all([
      this.applicationRepo.find({ where: { tenantId } }),
      this.placementRepo.find({ where: { tenantId } }),
      this.studentProfileRepo.find({ where: { tenantId } }),
      this.enrollmentRepo.find({ where: { tenantId } }),
    ]);

    const filteredApps = this.applyDateFilter(applications, query.from, query.to, 'createdAt' as keyof OpportunityApplication);

    const totalAccepted = filteredApps.filter(a => a.status === ApplicationStatus.ACCEPTED).length;
    const totalShortlisted = filteredApps.filter(a => a.status === ApplicationStatus.SHORTLISTED).length;

    const applicationsByStatus: Record<string, number> = {};
    for (const a of filteredApps) {
      applicationsByStatus[a.status] = (applicationsByStatus[a.status] ?? 0) + 1;
    }

    const completedPlacements = placements.filter(p => p.status === PlacementStatus.COMPLETED).length;
    const activePlacements = placements.filter(p => p.status === PlacementStatus.ACTIVE).length;
    const terminatedPlacements = placements.filter(p => p.status === PlacementStatus.TERMINATED).length;

    const placementsByType: Record<string, number> = {};
    for (const p of placements) {
      placementsByType[p.type] = (placementsByType[p.type] ?? 0) + 1;
    }

    // employmentRate: distinct students with accepted application OR completed placement
    const acceptedStudentIds = new Set(
      applications.filter(a => a.status === ApplicationStatus.ACCEPTED).map(a => a.studentProfileId),
    );
    const completedPlacementStudentIds = new Set(
      placements.filter(p => p.status === PlacementStatus.COMPLETED).map(p => p.studentProfileId),
    );
    const employedStudentIds = new Set([...acceptedStudentIds, ...completedPlacementStudentIds]);

    const graduatedStudentIds = new Set(students.filter(s => s.status === StudentStatus.GRADUATED).map(s => s.id));
    const activeEnrolledStudentIds = new Set(
      enrollments.filter(e => e.status === EnrollmentStatus.ACTIVE).map(e => e.studentProfileId),
    );
    const denominatorIds = new Set([...graduatedStudentIds, ...activeEnrolledStudentIds]);

    const denominator = denominatorIds.size;
    const numerator = [...employedStudentIds].filter(id => denominatorIds.has(id)).length;
    const employmentRate = denominator === 0 ? 0 : (numerator / denominator) * 100;

    return {
      totalAccepted,
      totalShortlisted,
      applicationsByStatus,
      completedPlacements,
      activePlacements,
      terminatedPlacements,
      placementsByType,
      employmentRate,
      computedAt: new Date().toISOString(),
    };
  }

  async getCredentialReport(tenantId: string, query: OutcomesQueryDto): Promise<CredentialReport> {
    const [badges, credentials, applications] = await Promise.all([
      this.badgeRepo.find({ where: { tenantId } }),
      this.credentialRepo.find({ where: { tenantId } }),
      this.applicationRepo.find({ where: { tenantId } }),
    ]);

    const filteredBadges = this.applyDateFilter(badges, query.from, query.to, 'issuedAt' as keyof IssuedBadge);
    const filteredCredentials = this.applyDateFilter(credentials, query.from, query.to, 'issuedAt' as keyof MicroCredential);

    const totalIssuedBadges = filteredBadges.filter(b => b.status === BadgeStatus.ISSUED).length;
    const revokedBadges = filteredBadges.filter(b => b.status === BadgeStatus.REVOKED).length;
    const activeMicroCredentials = filteredCredentials.filter(c => c.status === CredentialStatus.ACTIVE).length;
    const revokedMicroCredentials = filteredCredentials.filter(c => c.status === CredentialStatus.REVOKED).length;

    const issuedBadgesList = filteredBadges.filter(b => b.status === BadgeStatus.ISSUED);
    const activeCredentialsList = filteredCredentials.filter(c => c.status === CredentialStatus.ACTIVE);

    const badgesIssuedByMonth = this.groupByMonth(issuedBadgesList.map(b => ({ date: b.issuedAt })));
    const credentialsIssuedByMonth = this.groupByMonth(activeCredentialsList.map(c => ({ date: c.issuedAt })));

    // studentsWithCredentials: distinct students with at least 1 ISSUED badge OR 1 ACTIVE micro-credential
    const studentsWithCredentialIds = new Set([
      ...issuedBadgesList.map(b => b.studentProfileId),
      ...activeCredentialsList.map(c => c.studentProfileId),
    ]);
    const studentsWithCredentials = studentsWithCredentialIds.size;

    // studentsWithJobAfterCredential: students with credential AND accepted application AFTER earliest credential date
    // Use all (unfiltered) badges/credentials for this calculation
    const allIssuedBadges = badges.filter(b => b.status === BadgeStatus.ISSUED);
    const allActiveCredentials = credentials.filter(c => c.status === CredentialStatus.ACTIVE);

    // Build map: studentId -> earliest credential date
    const earliestCredentialByStudent = new Map<string, number>();
    for (const b of allIssuedBadges) {
      const t = new Date(b.issuedAt).getTime();
      const existing = earliestCredentialByStudent.get(b.studentProfileId);
      if (existing === undefined || t < existing) {
        earliestCredentialByStudent.set(b.studentProfileId, t);
      }
    }
    for (const c of allActiveCredentials) {
      const t = new Date(c.issuedAt).getTime();
      const existing = earliestCredentialByStudent.get(c.studentProfileId);
      if (existing === undefined || t < existing) {
        earliestCredentialByStudent.set(c.studentProfileId, t);
      }
    }

    // For each student with credentials, check if they have an accepted application after earliest credential
    const acceptedApps = applications.filter(a => a.status === ApplicationStatus.ACCEPTED);
    let studentsWithJobAfterCredential = 0;
    for (const [studentId, earliestDate] of earliestCredentialByStudent.entries()) {
      const hasJobAfter = acceptedApps.some(
        a => a.studentProfileId === studentId && new Date(a.createdAt).getTime() > earliestDate,
      );
      if (hasJobAfter) studentsWithJobAfterCredential++;
    }

    const credentialToJobConversionRate =
      studentsWithCredentials === 0 ? 0 : (studentsWithJobAfterCredential / studentsWithCredentials) * 100;

    return {
      totalIssuedBadges,
      revokedBadges,
      activeMicroCredentials,
      revokedMicroCredentials,
      badgesIssuedByMonth,
      credentialsIssuedByMonth,
      studentsWithCredentials,
      studentsWithJobAfterCredential,
      credentialToJobConversionRate,
      computedAt: new Date().toISOString(),
    };
  }
}
