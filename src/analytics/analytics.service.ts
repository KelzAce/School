import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Enrollment, EnrollmentStatus } from '../students/entities/enrollment.entity.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { Program } from '../courses/entities/program.entity.js';
import { Course } from '../courses/entities/course.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { Cohort } from '../schedules/entities/cohort.entity.js';
import { CohortEnrollment } from '../schedules/entities/cohort-enrollment.entity.js';
import { AnalyticsQueryDto, AnalyticsGranularity } from './dto/analytics-query.dto.js';

function getPeriodKey(date: Date, granularity: AnalyticsGranularity): string {
  const d = new Date(date);
  if (granularity === AnalyticsGranularity.DAY) {
    return d.toISOString().slice(0, 10);
  }
  if (granularity === AnalyticsGranularity.WEEK) {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 7);
}

function getDateRange(from?: string, to?: string): { start: Date; end: Date } {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(new Date().setMonth(new Date().getMonth() - 12));
  return { start, end };
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepo: Repository<StudentProfile>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(MasteryRecord)
    private readonly masteryRecordRepo: Repository<MasteryRecord>,
    @InjectRepository(StudentSkill)
    private readonly studentSkillRepo: Repository<StudentSkill>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(Cohort)
    private readonly cohortRepo: Repository<Cohort>,
    @InjectRepository(CohortEnrollment)
    private readonly cohortEnrollmentRepo: Repository<CohortEnrollment>,
  ) {}

  async getOverview(tenantId: string) {
    const [totalStudents, activeEnrollments, completedEnrollments, totalPrograms, totalCourses] =
      await Promise.all([
        this.studentProfileRepo.count({ where: { tenantId } }),
        this.enrollmentRepo.count({ where: { tenantId, status: EnrollmentStatus.ACTIVE } }),
        this.enrollmentRepo.count({ where: { tenantId, status: EnrollmentStatus.COMPLETED } }),
        this.programRepo.count({ where: { tenantId } }),
        this.courseRepo.count({ where: { tenantId } }),
      ]);

    const denominator = activeEnrollments + completedEnrollments;
    const overallCompletionRate =
      denominator > 0 ? Math.round((completedEnrollments / denominator) * 100) : 0;

    // Top 10 skills by student_skill count
    const skillCounts = await this.studentSkillRepo
      .createQueryBuilder('ss')
      .select('ss.skillId', 'skillId')
      .addSelect('COUNT(*)', 'count')
      .where('ss.tenantId = :tenantId', { tenantId })
      .groupBy('ss.skillId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany<{ skillId: string; count: string }>();

    const skillIds = skillCounts.map((r) => r.skillId);
    let topSkills: Array<{ skillId: string; skillName: string; count: number }> = [];
    if (skillIds.length > 0) {
      const skills = await this.skillRepo
        .createQueryBuilder('s')
        .where('s.id IN (:...ids)', { ids: skillIds })
        .getMany();
      const skillMap = new Map(skills.map((s) => [s.id, s.name]));
      topSkills = skillCounts.map((r) => ({
        skillId: r.skillId,
        skillName: skillMap.get(r.skillId) ?? 'Unknown',
        count: parseInt(r.count, 10),
      }));
    }

    return {
      totalStudents,
      activeEnrollments,
      completedEnrollments,
      totalPrograms,
      totalCourses,
      overallCompletionRate,
      topSkills,
    };
  }

  async getEnrollmentTrends(tenantId: string, query: AnalyticsQueryDto) {
    const granularity = query.granularity ?? AnalyticsGranularity.MONTH;
    const { start, end } = getDateRange(query.from, query.to);

    const enrollments = await this.enrollmentRepo.find({
      where: {
        tenantId,
        appliedAt: Between(start, end),
      },
      select: ['id', 'status', 'appliedAt'],
    });

    const buckets = new Map<
      string,
      { total: number; pending: number; active: number; completed: number; withdrawn: number }
    >();

    for (const e of enrollments) {
      const key = getPeriodKey(new Date(e.appliedAt), granularity);
      if (!buckets.has(key)) {
        buckets.set(key, { total: 0, pending: 0, active: 0, completed: 0, withdrawn: 0 });
      }
      const bucket = buckets.get(key)!;
      bucket.total++;
      if (e.status === EnrollmentStatus.PENDING || e.status === EnrollmentStatus.APPROVED) {
        bucket.pending++;
      } else if (e.status === EnrollmentStatus.ACTIVE) {
        bucket.active++;
      } else if (e.status === EnrollmentStatus.COMPLETED) {
        bucket.completed++;
      } else if (e.status === EnrollmentStatus.WITHDRAWN || e.status === EnrollmentStatus.REJECTED) {
        bucket.withdrawn++;
      }
    }

    const data = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, counts]) => ({ period, ...counts }));

    return {
      granularity,
      from: start.toISOString(),
      to: end.toISOString(),
      data,
    };
  }

  async getCompletionRates(tenantId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { tenantId },
      select: ['id', 'status', 'programId'],
      relations: ['program'],
    });

    const overall = {
      enrolled: enrollments.length,
      completed: enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED).length,
      rate: 0,
    };
    overall.rate =
      overall.enrolled > 0 ? Math.round((overall.completed / overall.enrolled) * 100) : 0;

    const programMap = new Map<
      string,
      {
        programId: string;
        programName: string;
        enrolled: number;
        active: number;
        completed: number;
        withdrawn: number;
      }
    >();

    for (const e of enrollments) {
      if (!e.programId) continue;
      if (!programMap.has(e.programId)) {
        programMap.set(e.programId, {
          programId: e.programId,
          programName: e.program?.name ?? 'Unknown',
          enrolled: 0,
          active: 0,
          completed: 0,
          withdrawn: 0,
        });
      }
      const entry = programMap.get(e.programId)!;
      entry.enrolled++;
      if (e.status === EnrollmentStatus.ACTIVE) entry.active++;
      else if (e.status === EnrollmentStatus.COMPLETED) entry.completed++;
      else if (e.status === EnrollmentStatus.WITHDRAWN || e.status === EnrollmentStatus.REJECTED) entry.withdrawn++;
    }

    const byProgram = Array.from(programMap.values()).map((p) => ({
      ...p,
      completionRate: p.enrolled > 0 ? Math.round((p.completed / p.enrolled) * 100) : 0,
    }));

    return { overall, byProgram };
  }

  async getSkillVelocity(tenantId: string, query: AnalyticsQueryDto) {
    const granularity = query.granularity ?? AnalyticsGranularity.MONTH;
    const { start, end } = getDateRange(query.from, query.to);

    const records = await this.masteryRecordRepo.find({
      where: {
        tenantId,
        achievedAt: Between(start, end),
      },
      select: ['id', 'achievedAt'],
    });

    const buckets = new Map<string, number>();
    for (const r of records) {
      const key = getPeriodKey(new Date(r.achievedAt), granularity);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    const data = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, masteryCount]) => ({ period, masteryCount }));

    return {
      granularity,
      from: start.toISOString(),
      to: end.toISOString(),
      data,
      totalMasteries: records.length,
    };
  }

  async getProgramStats(tenantId: string, programId: string) {
    const program = await this.programRepo.findOne({
      where: { id: programId, tenantId },
    });
    if (!program) {
      throw new NotFoundException(`Program ${programId} not found`);
    }

    const enrollments = await this.enrollmentRepo.find({
      where: { tenantId, programId },
      select: ['id', 'status'],
    });

    const cohortCount = await this.cohortRepo.count({
      where: { tenantId, programId },
    });

    const stats = {
      totalEnrolled: enrollments.length,
      pending: 0,
      active: 0,
      completed: 0,
      withdrawn: 0,
    };

    for (const e of enrollments) {
      if (e.status === EnrollmentStatus.PENDING || e.status === EnrollmentStatus.APPROVED) {
        stats.pending++;
      } else if (e.status === EnrollmentStatus.ACTIVE) {
        stats.active++;
      } else if (e.status === EnrollmentStatus.COMPLETED) {
        stats.completed++;
      } else if (e.status === EnrollmentStatus.WITHDRAWN || e.status === EnrollmentStatus.REJECTED) {
        stats.withdrawn++;
      }
    }

    const completionRate =
      stats.totalEnrolled > 0 ? Math.round((stats.completed / stats.totalEnrolled) * 100) : 0;

    return {
      programId: program.id,
      programName: program.name,
      ...stats,
      completionRate,
      cohortCount,
    };
  }
}
