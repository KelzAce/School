import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasteryRecord } from './entities/mastery-record.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';

const PROFICIENCY_ORDER: ProficiencyLevel[] = [
  ProficiencyLevel.NOVICE,
  ProficiencyLevel.BEGINNER,
  ProficiencyLevel.INTERMEDIATE,
  ProficiencyLevel.ADVANCED,
  ProficiencyLevel.EXPERT,
];

function proficiencyIndex(level: ProficiencyLevel): number {
  return PROFICIENCY_ORDER.indexOf(level);
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  skillCode: string;
  targetLevel: ProficiencyLevel;
  currentLevel: ProficiencyLevel | null;
  isMastered: boolean;
  masteryHistory: Array<{
    level: ProficiencyLevel;
    achievedAt: Date;
  }>;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  totalSkills: number;
  masteredSkills: number;
  progressPercent: number;
  skills: SkillProgress[];
}

export interface StudentProgressSummary {
  studentProfileId: string;
  totalSkillsTracked: number;
  totalMasteries: number;
  overallProgressPercent: number;
  levelDistribution: Record<ProficiencyLevel, number>;
  courseProgress: CourseProgress[];
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(MasteryRecord)
    private readonly masteryRepo: Repository<MasteryRecord>,
    @InjectRepository(CourseSkill)
    private readonly courseSkillRepo: Repository<CourseSkill>,
    @InjectRepository(StudentSkill)
    private readonly studentSkillRepo: Repository<StudentSkill>,
  ) {}

  async getStudentProgress(
    tenantId: string,
    studentProfileId: string,
  ): Promise<StudentProgressSummary> {
    const studentSkills = await this.studentSkillRepo.find({
      where: { tenantId, studentProfileId },
      relations: ['skill'],
    });

    const masteries = await this.masteryRepo.find({
      where: { tenantId, studentProfileId },
      order: { achievedAt: 'ASC' },
    });

    const levelDistribution = {} as Record<ProficiencyLevel, number>;
    for (const lvl of PROFICIENCY_ORDER) {
      levelDistribution[lvl] = 0;
    }
    for (const ss of studentSkills) {
      levelDistribution[ss.currentLevel] =
        (levelDistribution[ss.currentLevel] ?? 0) + 1;
    }

    // Get all course skills for courses the student might be enrolled in
    // We gather unique courseIds from masteries + assessments
    const courseSkills = await this.courseSkillRepo.find({
      where: { tenantId },
      relations: ['skill', 'course'],
    });

    // Group by courseId
    const courseMap = new Map<
      string,
      { title: string; code: string; skills: CourseSkill[] }
    >();
    for (const cs of courseSkills) {
      if (!courseMap.has(cs.courseId)) {
        courseMap.set(cs.courseId, {
          title: cs.course?.title ?? '',
          code: cs.course?.code ?? '',
          skills: [],
        });
      }
      courseMap.get(cs.courseId)!.skills.push(cs);
    }

    const studentSkillMap = new Map<string, StudentSkill>();
    for (const ss of studentSkills) {
      studentSkillMap.set(ss.skillId, ss);
    }

    const masteryMap = new Map<string, MasteryRecord[]>();
    for (const m of masteries) {
      if (!masteryMap.has(m.skillId)) {
        masteryMap.set(m.skillId, []);
      }
      masteryMap.get(m.skillId)!.push(m);
    }

    const courseProgress: CourseProgress[] = [];
    let totalTargetSkills = 0;
    let totalMasteredSkills = 0;

    for (const [courseId, courseData] of courseMap) {
      const skills: SkillProgress[] = courseData.skills.map((cs) => {
        const ss = studentSkillMap.get(cs.skillId);
        const currentLevel = ss?.currentLevel ?? null;
        const isMastered =
          currentLevel !== null &&
          proficiencyIndex(currentLevel) >= proficiencyIndex(cs.targetLevel);

        const history = (masteryMap.get(cs.skillId) ?? []).map((m) => ({
          level: m.level,
          achievedAt: m.achievedAt,
        }));

        return {
          skillId: cs.skillId,
          skillName: cs.skill?.name ?? '',
          skillCode: cs.skill?.code ?? '',
          targetLevel: cs.targetLevel,
          currentLevel,
          isMastered,
          masteryHistory: history,
        };
      });

      const masteredCount = skills.filter((s) => s.isMastered).length;
      totalTargetSkills += skills.length;
      totalMasteredSkills += masteredCount;

      courseProgress.push({
        courseId,
        courseTitle: courseData.title,
        courseCode: courseData.code,
        totalSkills: skills.length,
        masteredSkills: masteredCount,
        progressPercent:
          skills.length > 0
            ? Math.round((masteredCount / skills.length) * 100)
            : 0,
        skills,
      });
    }

    return {
      studentProfileId,
      totalSkillsTracked: studentSkills.length,
      totalMasteries: masteries.length,
      overallProgressPercent:
        totalTargetSkills > 0
          ? Math.round((totalMasteredSkills / totalTargetSkills) * 100)
          : 0,
      levelDistribution,
      courseProgress,
    };
  }

  async getCourseProgress(
    tenantId: string,
    courseId: string,
    studentProfileId: string,
  ): Promise<CourseProgress> {
    const courseSkills = await this.courseSkillRepo.find({
      where: { tenantId, courseId },
      relations: ['skill', 'course'],
    });

    const studentSkills = await this.studentSkillRepo.find({
      where: { tenantId, studentProfileId },
    });
    const ssMap = new Map<string, StudentSkill>();
    for (const ss of studentSkills) {
      ssMap.set(ss.skillId, ss);
    }

    const masteries = await this.masteryRepo.find({
      where: { tenantId, studentProfileId },
      order: { achievedAt: 'ASC' },
    });
    const masteryMap = new Map<string, MasteryRecord[]>();
    for (const m of masteries) {
      if (!masteryMap.has(m.skillId)) {
        masteryMap.set(m.skillId, []);
      }
      masteryMap.get(m.skillId)!.push(m);
    }

    const skills: SkillProgress[] = courseSkills.map((cs) => {
      const ss = ssMap.get(cs.skillId);
      const currentLevel = ss?.currentLevel ?? null;
      const isMastered =
        currentLevel !== null &&
        proficiencyIndex(currentLevel) >= proficiencyIndex(cs.targetLevel);

      return {
        skillId: cs.skillId,
        skillName: cs.skill?.name ?? '',
        skillCode: cs.skill?.code ?? '',
        targetLevel: cs.targetLevel,
        currentLevel,
        isMastered,
        masteryHistory: (masteryMap.get(cs.skillId) ?? []).map((m) => ({
          level: m.level,
          achievedAt: m.achievedAt,
        })),
      };
    });

    const masteredCount = skills.filter((s) => s.isMastered).length;
    const courseName = courseSkills[0]?.course?.title ?? '';
    const courseCode = courseSkills[0]?.course?.code ?? '';

    return {
      courseId,
      courseTitle: courseName,
      courseCode,
      totalSkills: skills.length,
      masteredSkills: masteredCount,
      progressPercent:
        skills.length > 0
          ? Math.round((masteredCount / skills.length) * 100)
          : 0,
      skills,
    };
  }

  async getMasteryTimeline(
    tenantId: string,
    studentProfileId: string,
  ): Promise<MasteryRecord[]> {
    return this.masteryRepo.find({
      where: { tenantId, studentProfileId },
      relations: ['skill'],
      order: { achievedAt: 'ASC' },
    });
  }
}
