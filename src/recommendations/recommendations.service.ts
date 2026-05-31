import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { Course, CourseStatus } from '../courses/entities/course.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { Enrollment, EnrollmentStatus } from '../students/entities/enrollment.entity.js';
import { CareerPathway } from '../career-pathways/entities/career-pathway.entity.js';
import { CareerPathwaySkill } from '../career-pathways/entities/career-pathway-skill.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { Program } from '../courses/entities/program.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { RecommendationQueryDto } from './dto/index.js';

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

export interface CourseRecommendation {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  difficulty: string;
  learningTrack: string;
  score: number;
  gapSkillsCovered: number;
  criticalSkillsCovered: number;
  totalSkillsTaught: number;
  reasons: string[];
  skills: Array<{
    skillId: string;
    skillCode: string;
    skillName: string;
    targetLevel: ProficiencyLevel;
    currentLevel: ProficiencyLevel | null;
    isGap: boolean;
    isCritical: boolean;
  }>;
}

export interface SkillRecommendation {
  skillId: string;
  skillCode: string;
  skillName: string;
  skillType: string;
  currentLevel: ProficiencyLevel | null;
  targetLevel: ProficiencyLevel;
  gapLevels: number;
  isCritical: boolean;
  pathwayCount: number;
  score: number;
  pathways: Array<{
    pathwayId: string;
    pathwayTitle: string;
    requiredLevel: ProficiencyLevel;
    isCritical: boolean;
  }>;
}

async function buildStudentSkillMap(
  tenantId: string,
  studentProfileId: string,
  studentSkillRepo: Repository<StudentSkill>,
  masteryRepo: Repository<MasteryRecord>,
): Promise<Map<string, ProficiencyLevel>> {
  const [studentSkills, masteryRecords] = await Promise.all([
    studentSkillRepo.find({ where: { tenantId, studentProfileId } }),
    masteryRepo.find({ where: { tenantId, studentProfileId } }),
  ]);

  const skillMap = new Map<string, ProficiencyLevel>();

  for (const ss of studentSkills) {
    skillMap.set(ss.skillId, ss.currentLevel);
  }

  for (const mr of masteryRecords) {
    const existing = skillMap.get(mr.skillId);
    if (!existing || proficiencyIndex(mr.level) > proficiencyIndex(existing)) {
      skillMap.set(mr.skillId, mr.level);
    }
  }

  return skillMap;
}

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly studentRepo: Repository<StudentProfile>,
    @InjectRepository(StudentSkill)
    private readonly studentSkillRepo: Repository<StudentSkill>,
    @InjectRepository(MasteryRecord)
    private readonly masteryRepo: Repository<MasteryRecord>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(CourseSkill)
    private readonly courseSkillRepo: Repository<CourseSkill>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(CareerPathway)
    private readonly pathwayRepo: Repository<CareerPathway>,
    @InjectRepository(CareerPathwaySkill)
    private readonly pathwaySkillRepo: Repository<CareerPathwaySkill>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
  ) {}

  async getCourseRecommendations(
    tenantId: string,
    studentProfileId: string,
    query: RecommendationQueryDto,
    requester?: User,
  ): Promise<CourseRecommendation[]> {
    const student = await this.studentRepo.findOne({ where: { id: studentProfileId, tenantId } });
    if (!student) {
      throw new NotFoundException(`Student profile ${studentProfileId} not found`);
    }
    if (requester?.role === UserRole.STUDENT && requester.id !== student.userId) {
      throw new ForbiddenException('Students can only view their own recommendations');
    }

    const studentSkillMap = await buildStudentSkillMap(
      tenantId,
      studentProfileId,
      this.studentSkillRepo,
      this.masteryRepo,
    );

    const courses = await this.courseRepo.find({ where: { tenantId, status: CourseStatus.PUBLISHED } });
    if (courses.length === 0) return [];

    const courseIds = courses.map((c) => c.id);
    const courseSkills = await this.courseSkillRepo.find({
      where: { tenantId, courseId: In(courseIds) },
      relations: ['skill'],
    });

    // Build a map of courseId -> CourseSkill[]
    const courseSkillMap = new Map<string, CourseSkill[]>();
    for (const cs of courseSkills) {
      const arr = courseSkillMap.get(cs.courseId) ?? [];
      arr.push(cs);
      courseSkillMap.set(cs.courseId, arr);
    }

    // Determine gap skill IDs
    let gapSkillIds: Set<string>;
    // Map of skillId -> isCritical (from pathway skills)
    const criticalSkillIds = new Set<string>();

    if (query.pathwayId) {
      const pathwaySkills = await this.pathwaySkillRepo.find({
        where: { tenantId, pathwayId: query.pathwayId },
      });
      gapSkillIds = new Set<string>();
      for (const ps of pathwaySkills) {
        const currentLevel = studentSkillMap.get(ps.skillId);
        const currentIdx = currentLevel !== undefined ? proficiencyIndex(currentLevel) : -1;
        const requiredIdx = proficiencyIndex(ps.requiredLevel);
        if (currentIdx < requiredIdx) {
          gapSkillIds.add(ps.skillId);
        }
        if (ps.isCritical) {
          criticalSkillIds.add(ps.skillId);
        }
      }
    } else {
      const publishedPathways = await this.pathwayRepo.find({ where: { tenantId, isPublished: true } });
      gapSkillIds = new Set<string>();
      if (publishedPathways.length > 0) {
        const pathwayIds = publishedPathways.map((p) => p.id);
        const allPathwaySkills = await this.pathwaySkillRepo.find({
          where: { tenantId, pathwayId: In(pathwayIds) },
        });
        for (const ps of allPathwaySkills) {
          const currentLevel = studentSkillMap.get(ps.skillId);
          const currentIdx = currentLevel !== undefined ? proficiencyIndex(currentLevel) : -1;
          const requiredIdx = proficiencyIndex(ps.requiredLevel);
          if (currentIdx < requiredIdx) {
            gapSkillIds.add(ps.skillId);
          }
          if (ps.isCritical) {
            criticalSkillIds.add(ps.skillId);
          }
        }
      }
    }

    const limit = query.limit ?? 10;
    const recommendations: CourseRecommendation[] = [];

    for (const course of courses) {
      const cSkills = courseSkillMap.get(course.id) ?? [];
      const totalSkillsTaught = cSkills.length;

      let gapSkillsCovered = 0;
      let criticalSkillsCovered = 0;

      const skillDetails: CourseRecommendation['skills'] = [];

      for (const cs of cSkills) {
        const currentLevel = studentSkillMap.get(cs.skillId) ?? null;
        const currentIdx = currentLevel !== null ? proficiencyIndex(currentLevel) : -1;
        const targetIdx = proficiencyIndex(cs.targetLevel);
        const isGap = gapSkillIds.has(cs.skillId) && currentIdx < targetIdx;
        const isCritical = criticalSkillIds.has(cs.skillId);

        if (isGap) {
          gapSkillsCovered++;
          if (isCritical) {
            criticalSkillsCovered++;
          }
        }

        skillDetails.push({
          skillId: cs.skillId,
          skillCode: cs.skill?.code ?? '',
          skillName: cs.skill?.name ?? '',
          targetLevel: cs.targetLevel,
          currentLevel,
          isGap,
          isCritical,
        });
      }

      const coverageRatio = gapSkillsCovered / Math.max(totalSkillsTaught, 1);
      const score = gapSkillsCovered * 3 + criticalSkillsCovered * 2 + coverageRatio * 10;

      if (score === 0) continue;

      const reasons: string[] = [];
      if (gapSkillsCovered > 0) {
        reasons.push(`Covers ${gapSkillsCovered} of your skill gap${gapSkillsCovered > 1 ? 's' : ''}`);
      }
      if (criticalSkillsCovered > 0) {
        reasons.push(`Addresses ${criticalSkillsCovered} critical pathway skill${criticalSkillsCovered > 1 ? 's' : ''}`);
      }

      recommendations.push({
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        difficulty: course.difficulty,
        learningTrack: course.learningTrack,
        score,
        gapSkillsCovered,
        criticalSkillsCovered,
        totalSkillsTaught,
        reasons,
        skills: skillDetails,
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, limit);
  }

  async getPathwayCourseRecommendations(
    tenantId: string,
    studentProfileId: string,
    pathwayId: string,
    requester?: User,
  ): Promise<CourseRecommendation[]> {
    const student = await this.studentRepo.findOne({ where: { id: studentProfileId, tenantId } });
    if (!student) {
      throw new NotFoundException(`Student profile ${studentProfileId} not found`);
    }
    if (requester?.role === UserRole.STUDENT && requester.id !== student.userId) {
      throw new ForbiddenException('Students can only view their own recommendations');
    }

    const pathway = await this.pathwayRepo.findOne({ where: { id: pathwayId, tenantId } });
    if (!pathway) {
      throw new NotFoundException(`Career pathway ${pathwayId} not found`);
    }

    const pathwaySkills = await this.pathwaySkillRepo.find({
      where: { tenantId, pathwayId },
      relations: ['skill'],
    });

    const studentSkillMap = await buildStudentSkillMap(
      tenantId,
      studentProfileId,
      this.studentSkillRepo,
      this.masteryRepo,
    );

    // Find skills the student hasn't mastered for this pathway
    const gapSkillIds = new Set<string>();
    const criticalSkillIds = new Set<string>();
    const pathwaySkillMap = new Map<string, CareerPathwaySkill>();

    for (const ps of pathwaySkills) {
      pathwaySkillMap.set(ps.skillId, ps);
      const currentLevel = studentSkillMap.get(ps.skillId);
      const currentIdx = currentLevel !== undefined ? proficiencyIndex(currentLevel) : -1;
      const requiredIdx = proficiencyIndex(ps.requiredLevel);
      if (currentIdx < requiredIdx) {
        gapSkillIds.add(ps.skillId);
      }
      if (ps.isCritical) {
        criticalSkillIds.add(ps.skillId);
      }
    }

    const courses = await this.courseRepo.find({ where: { tenantId, status: CourseStatus.PUBLISHED } });
    if (courses.length === 0) return [];

    const courseIds = courses.map((c) => c.id);
    const courseSkills = await this.courseSkillRepo.find({
      where: { tenantId, courseId: In(courseIds) },
      relations: ['skill'],
    });

    const courseSkillMap = new Map<string, CourseSkill[]>();
    for (const cs of courseSkills) {
      const arr = courseSkillMap.get(cs.courseId) ?? [];
      arr.push(cs);
      courseSkillMap.set(cs.courseId, arr);
    }

    const recommendations: CourseRecommendation[] = [];

    for (const course of courses) {
      const cSkills = courseSkillMap.get(course.id) ?? [];
      const totalSkillsTaught = cSkills.length;

      let gapSkillsCovered = 0;
      let criticalSkillsCovered = 0;
      const coveredPathwaySkillNames: string[] = [];

      const skillDetails: CourseRecommendation['skills'] = [];

      for (const cs of cSkills) {
        const currentLevel = studentSkillMap.get(cs.skillId) ?? null;
        const currentIdx = currentLevel !== null ? proficiencyIndex(currentLevel) : -1;
        const targetIdx = proficiencyIndex(cs.targetLevel);
        const isGap = gapSkillIds.has(cs.skillId) && currentIdx < targetIdx;
        const isCritical = criticalSkillIds.has(cs.skillId);

        if (isGap) {
          gapSkillsCovered++;
          if (isCritical) {
            criticalSkillsCovered++;
          }
          if (cs.skill?.name) {
            coveredPathwaySkillNames.push(cs.skill.name);
          }
        }

        skillDetails.push({
          skillId: cs.skillId,
          skillCode: cs.skill?.code ?? '',
          skillName: cs.skill?.name ?? '',
          targetLevel: cs.targetLevel,
          currentLevel,
          isGap,
          isCritical,
        });
      }

      if (gapSkillsCovered === 0) continue;

      const coverageRatio = gapSkillsCovered / Math.max(totalSkillsTaught, 1);
      const score = gapSkillsCovered * 3 + criticalSkillsCovered * 2 + coverageRatio * 10;

      const reasons: string[] = [];
      if (coveredPathwaySkillNames.length > 0) {
        reasons.push(
          `Covers pathway skills: ${coveredPathwaySkillNames.slice(0, 3).join(', ')}${coveredPathwaySkillNames.length > 3 ? ` and ${coveredPathwaySkillNames.length - 3} more` : ''}`,
        );
      }
      if (criticalSkillsCovered > 0) {
        reasons.push(`Addresses ${criticalSkillsCovered} critical ${pathway.title} skill${criticalSkillsCovered > 1 ? 's' : ''}`);
      }

      recommendations.push({
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        difficulty: course.difficulty,
        learningTrack: course.learningTrack,
        score,
        gapSkillsCovered,
        criticalSkillsCovered,
        totalSkillsTaught,
        reasons,
        skills: skillDetails,
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 10);
  }

  async getSkillRecommendations(
    tenantId: string,
    studentProfileId: string,
    requester?: User,
  ): Promise<SkillRecommendation[]> {
    const student = await this.studentRepo.findOne({ where: { id: studentProfileId, tenantId } });
    if (!student) {
      throw new NotFoundException(`Student profile ${studentProfileId} not found`);
    }
    if (requester?.role === UserRole.STUDENT && requester.id !== student.userId) {
      throw new ForbiddenException('Students can only view their own recommendations');
    }

    const studentSkillMap = await buildStudentSkillMap(
      tenantId,
      studentProfileId,
      this.studentSkillRepo,
      this.masteryRepo,
    );

    const publishedPathways = await this.pathwayRepo.find({ where: { tenantId, isPublished: true } });
    if (publishedPathways.length === 0) return [];

    const pathwayIds = publishedPathways.map((p) => p.id);
    const allPathwaySkills = await this.pathwaySkillRepo.find({
      where: { tenantId, pathwayId: In(pathwayIds) },
      relations: ['skill'],
    });

    // pathwayId -> title
    const pathwayTitleMap = new Map<string, string>();
    for (const p of publishedPathways) {
      pathwayTitleMap.set(p.id, p.title);
    }

    // skillId -> best SkillRecommendation
    const skillRecMap = new Map<string, SkillRecommendation>();

    for (const ps of allPathwaySkills) {
      if (!ps.skill) continue;

      const currentLevel = studentSkillMap.get(ps.skillId) ?? null;
      const currentIdx = currentLevel !== null ? proficiencyIndex(currentLevel) : -1;
      const requiredIdx = proficiencyIndex(ps.requiredLevel);

      // Only recommend unmastered skills
      if (currentIdx >= requiredIdx) continue;

      const gapLevels = currentLevel !== null
        ? requiredIdx - currentIdx
        : requiredIdx + 1;

      const existing = skillRecMap.get(ps.skillId);

      const pathwayEntry = {
        pathwayId: ps.pathwayId,
        pathwayTitle: pathwayTitleMap.get(ps.pathwayId) ?? '',
        requiredLevel: ps.requiredLevel,
        isCritical: ps.isCritical,
      };

      if (existing) {
        // Update existing entry
        existing.pathways.push(pathwayEntry);
        existing.pathwayCount++;
        if (ps.isCritical) existing.isCritical = true;
        // Use highest required level
        if (requiredIdx > proficiencyIndex(existing.targetLevel)) {
          existing.targetLevel = ps.requiredLevel;
        }
        // Use smallest gapLevels (closest to mastery) for score calc base
        if (gapLevels < existing.gapLevels) {
          existing.gapLevels = gapLevels;
        }
        // Recalculate score
        existing.score =
          (existing.isCritical ? 20 : 0) +
          existing.pathwayCount * 5 +
          Math.max(0, 10 - existing.gapLevels * 2);
      } else {
        const score =
          (ps.isCritical ? 20 : 0) +
          1 * 5 +
          Math.max(0, 10 - gapLevels * 2);

        skillRecMap.set(ps.skillId, {
          skillId: ps.skillId,
          skillCode: ps.skill.code,
          skillName: ps.skill.name,
          skillType: ps.skill.type,
          currentLevel,
          targetLevel: ps.requiredLevel,
          gapLevels,
          isCritical: ps.isCritical,
          pathwayCount: 1,
          score,
          pathways: [pathwayEntry],
        });
      }
    }

    const results = Array.from(skillRecMap.values());
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 15);
  }
}
