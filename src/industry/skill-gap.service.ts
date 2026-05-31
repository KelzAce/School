import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Opportunity, OpportunityStatus } from './entities/opportunity.entity.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { AnalyzeCustomSkillGapDto } from './dto/skill-gap.dto.js';

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

interface CourseRecommendation {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  targetLevel: ProficiencyLevel;
  isPrimary: boolean;
}

type SkillGapStatus = 'matched' | 'under_leveled' | 'missing';

interface SkillGapItem {
  skillId: string;
  skillCode: string;
  skillName: string;
  requiredLevel: ProficiencyLevel;
  currentLevel: ProficiencyLevel | null;
  gapLevels: number;
  status: SkillGapStatus;
  recommendations: CourseRecommendation[];
}

interface SkillGapComputationResult {
  readinessPercent: number;
  requiredSkillsCount: number;
  matchedSkillsCount: number;
  missingSkillsCount: number;
  underLeveledSkillsCount: number;
  matchedSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  underLeveledSkills: SkillGapItem[];
  recommendedCourseIds: string[];
}

export interface SkillGapAnalysisResponse extends SkillGapComputationResult {
  studentProfileId: string;
  targetType: 'opportunity' | 'custom';
  targetId: string | null;
  targetName: string;
  requiredLevel: ProficiencyLevel;
}

export interface SkillGapSummaryResponse {
  studentProfileId: string;
  opportunitiesAnalyzed: number;
  averageReadinessPercent: number;
  bestFitOpportunities: Array<{
    opportunityId: string;
    title: string;
    readinessPercent: number;
    missingSkillsCount: number;
    underLeveledSkillsCount: number;
  }>;
  mostDemandedMissingSkills: Array<{
    skillId: string;
    skillCode: string;
    skillName: string;
    occurrences: number;
  }>;
}

@Injectable()
export class SkillGapService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepo: Repository<Opportunity>,
    @InjectRepository(StudentProfile)
    private readonly studentRepo: Repository<StudentProfile>,
    @InjectRepository(StudentSkill)
    private readonly studentSkillRepo: Repository<StudentSkill>,
    @InjectRepository(MasteryRecord)
    private readonly masteryRepo: Repository<MasteryRecord>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(CourseSkill)
    private readonly courseSkillRepo: Repository<CourseSkill>,
  ) {}

  async getStudentOpportunityGap(
    tenantId: string,
    studentProfileId: string,
    opportunityId: string,
    requester?: User,
  ): Promise<SkillGapAnalysisResponse> {
    await this.validateStudentAccess(tenantId, studentProfileId, requester);

    const opportunity = await this.opportunityRepo.findOne({
      where: { id: opportunityId, tenantId },
    });
    if (!opportunity) {
      throw new NotFoundException(`Opportunity "${opportunityId}" not found`);
    }

    const requiredSkillIds = Array.from(new Set(opportunity.requiredSkillIds ?? []));
    const requiredLevel = opportunity.requiredLevel ?? ProficiencyLevel.BEGINNER;

    const result = await this.computeSkillGap(
      tenantId,
      studentProfileId,
      requiredSkillIds,
      requiredLevel,
      true,
    );

    return {
      studentProfileId,
      targetType: 'opportunity',
      targetId: opportunity.id,
      targetName: opportunity.title,
      requiredLevel,
      ...result,
    };
  }

  async analyzeCustomTarget(
    tenantId: string,
    studentProfileId: string,
    dto: AnalyzeCustomSkillGapDto,
    requester?: User,
  ): Promise<SkillGapAnalysisResponse> {
    await this.validateStudentAccess(tenantId, studentProfileId, requester);

    const requiredSkillIds = Array.from(new Set(dto.requiredSkillIds ?? []));
    const requiredLevel = dto.requiredLevel ?? ProficiencyLevel.BEGINNER;
    const includeCourseRecommendations = dto.includeCourseRecommendations ?? true;

    const result = await this.computeSkillGap(
      tenantId,
      studentProfileId,
      requiredSkillIds,
      requiredLevel,
      includeCourseRecommendations,
    );

    return {
      studentProfileId,
      targetType: 'custom',
      targetId: null,
      targetName: dto.targetName ?? 'Custom Target',
      requiredLevel,
      ...result,
    };
  }

  async getStudentGapSummary(
    tenantId: string,
    studentProfileId: string,
    requester?: User,
  ): Promise<SkillGapSummaryResponse> {
    await this.validateStudentAccess(tenantId, studentProfileId, requester);

    const openOpportunities = await this.opportunityRepo.find({
      where: { tenantId, status: OpportunityStatus.OPEN },
      order: { createdAt: 'DESC' },
    });

    const opportunities = openOpportunities.filter(
      (opportunity) => (opportunity.requiredSkillIds ?? []).length > 0,
    );

    if (opportunities.length === 0) {
      return {
        studentProfileId,
        opportunitiesAnalyzed: 0,
        averageReadinessPercent: 0,
        bestFitOpportunities: [],
        mostDemandedMissingSkills: [],
      };
    }

    const allRequiredSkillIds = Array.from(
      new Set(
        opportunities.flatMap((opportunity) => opportunity.requiredSkillIds ?? []),
      ),
    );

    const [skillsById, currentLevelBySkillId] = await Promise.all([
      this.getSkillsMap(tenantId, allRequiredSkillIds),
      this.getCurrentLevelBySkillId(tenantId, studentProfileId, allRequiredSkillIds),
    ]);

    const opportunityResults = opportunities.map((opportunity) => {
      const requiredSkillIds = Array.from(new Set(opportunity.requiredSkillIds ?? []));
      const requiredLevel = opportunity.requiredLevel ?? ProficiencyLevel.BEGINNER;
      const result = this.computeFromMaps(
        requiredSkillIds,
        requiredLevel,
        skillsById,
        currentLevelBySkillId,
        new Map(),
      );

      return {
        opportunityId: opportunity.id,
        title: opportunity.title,
        readinessPercent: result.readinessPercent,
        missingSkillsCount: result.missingSkillsCount,
        underLeveledSkillsCount: result.underLeveledSkillsCount,
        missingSkillIds: result.missingSkills.map((skill) => skill.skillId),
      };
    });

    const missingSkillCounts = new Map<string, number>();
    for (const result of opportunityResults) {
      for (const skillId of result.missingSkillIds) {
        missingSkillCounts.set(skillId, (missingSkillCounts.get(skillId) ?? 0) + 1);
      }
    }

    const mostDemandedMissingSkills = Array.from(missingSkillCounts.entries())
      .map(([skillId, occurrences]) => {
        const skill = skillsById.get(skillId);
        return {
          skillId,
          skillCode: skill?.code ?? '',
          skillName: skill?.name ?? '',
          occurrences,
        };
      })
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10);

    const averageReadinessPercent = Math.round(
      opportunityResults.reduce((sum, result) => sum + result.readinessPercent, 0) /
        opportunityResults.length,
    );

    const bestFitOpportunities = [...opportunityResults]
      .sort((a, b) => b.readinessPercent - a.readinessPercent)
      .slice(0, 5)
      .map(({ missingSkillIds: _missingSkillIds, ...rest }) => rest);

    return {
      studentProfileId,
      opportunitiesAnalyzed: opportunityResults.length,
      averageReadinessPercent,
      bestFitOpportunities,
      mostDemandedMissingSkills,
    };
  }

  private async validateStudentAccess(
    tenantId: string,
    studentProfileId: string,
    requester?: User,
  ): Promise<StudentProfile> {
    const studentProfile = await this.studentRepo.findOne({
      where: { id: studentProfileId, tenantId },
    });

    if (!studentProfile) {
      throw new NotFoundException(`Student profile "${studentProfileId}" not found`);
    }

    if (requester?.role === UserRole.STUDENT && requester.id !== studentProfile.userId) {
      throw new ForbiddenException('Students can only view their own skill gap analysis');
    }

    return studentProfile;
  }

  private async computeSkillGap(
    tenantId: string,
    studentProfileId: string,
    requiredSkillIds: string[],
    requiredLevel: ProficiencyLevel,
    includeCourseRecommendations: boolean,
  ): Promise<SkillGapComputationResult> {
    const uniqueRequiredSkillIds = Array.from(new Set(requiredSkillIds));
    if (uniqueRequiredSkillIds.length === 0) {
      return {
        readinessPercent: 100,
        requiredSkillsCount: 0,
        matchedSkillsCount: 0,
        missingSkillsCount: 0,
        underLeveledSkillsCount: 0,
        matchedSkills: [],
        missingSkills: [],
        underLeveledSkills: [],
        recommendedCourseIds: [],
      };
    }

    const [skillsById, currentLevelBySkillId] = await Promise.all([
      this.getSkillsMap(tenantId, uniqueRequiredSkillIds),
      this.getCurrentLevelBySkillId(tenantId, studentProfileId, uniqueRequiredSkillIds),
    ]);

    const recommendationsBySkillId = includeCourseRecommendations
      ? await this.getRecommendationsBySkillId(
          tenantId,
          uniqueRequiredSkillIds,
          currentLevelBySkillId,
          requiredLevel,
        )
      : new Map<string, CourseRecommendation[]>();

    return this.computeFromMaps(
      uniqueRequiredSkillIds,
      requiredLevel,
      skillsById,
      currentLevelBySkillId,
      recommendationsBySkillId,
    );
  }

  private async getSkillsMap(
    tenantId: string,
    skillIds: string[],
  ): Promise<Map<string, Skill>> {
    if (skillIds.length === 0) {
      return new Map();
    }

    const skills = await this.skillRepo.find({
      where: { tenantId, id: In(skillIds) },
    });

    const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
    const missingSkillIds = skillIds.filter((skillId) => !skillsById.has(skillId));
    if (missingSkillIds.length > 0) {
      throw new NotFoundException(
        `Skills not found in tenant: ${missingSkillIds.join(', ')}`,
      );
    }

    return skillsById;
  }

  private async getCurrentLevelBySkillId(
    tenantId: string,
    studentProfileId: string,
    skillIds: string[],
  ): Promise<Map<string, ProficiencyLevel>> {
    if (skillIds.length === 0) {
      return new Map();
    }

    const [studentSkills, masteryRecords] = await Promise.all([
      this.studentSkillRepo.find({
        where: {
          tenantId,
          studentProfileId,
          skillId: In(skillIds),
        },
      }),
      this.masteryRepo.find({
        where: {
          tenantId,
          studentProfileId,
          skillId: In(skillIds),
        },
      }),
    ]);

    const currentLevelBySkillId = new Map<string, ProficiencyLevel>();
    for (const studentSkill of studentSkills) {
      currentLevelBySkillId.set(studentSkill.skillId, studentSkill.currentLevel);
    }

    for (const mastery of masteryRecords) {
      const existingLevel = currentLevelBySkillId.get(mastery.skillId);
      if (
        !existingLevel ||
        proficiencyIndex(mastery.level) > proficiencyIndex(existingLevel)
      ) {
        currentLevelBySkillId.set(mastery.skillId, mastery.level);
      }
    }

    return currentLevelBySkillId;
  }

  private async getRecommendationsBySkillId(
    tenantId: string,
    skillIds: string[],
    currentLevelBySkillId: Map<string, ProficiencyLevel>,
    requiredLevel: ProficiencyLevel,
  ): Promise<Map<string, CourseRecommendation[]>> {
    if (skillIds.length === 0) {
      return new Map();
    }

    const courseSkills = await this.courseSkillRepo.find({
      where: { tenantId, skillId: In(skillIds) },
      relations: ['course'],
    });

    const recommendationsBySkillId = new Map<string, CourseRecommendation[]>();

    for (const courseSkill of courseSkills) {
      const currentLevel = currentLevelBySkillId.get(courseSkill.skillId);
      const minimumTargetLevel = currentLevel
        ? PROFICIENCY_ORDER[Math.min(proficiencyIndex(currentLevel) + 1, PROFICIENCY_ORDER.length - 1)]
        : requiredLevel;

      if (
        proficiencyIndex(courseSkill.targetLevel) <
        proficiencyIndex(minimumTargetLevel)
      ) {
        continue;
      }

      const recommendation: CourseRecommendation = {
        courseId: courseSkill.courseId,
        courseCode: courseSkill.course?.code ?? '',
        courseTitle: courseSkill.course?.title ?? '',
        targetLevel: courseSkill.targetLevel,
        isPrimary: courseSkill.isPrimary,
      };

      if (!recommendationsBySkillId.has(courseSkill.skillId)) {
        recommendationsBySkillId.set(courseSkill.skillId, []);
      }
      recommendationsBySkillId.get(courseSkill.skillId)!.push(recommendation);
    }

    for (const [skillId, recommendations] of recommendationsBySkillId) {
      const deduped = Array.from(
        new Map(recommendations.map((rec) => [rec.courseId, rec])).values(),
      )
        .sort((a, b) => {
          if (a.isPrimary !== b.isPrimary) {
            return a.isPrimary ? -1 : 1;
          }
          return proficiencyIndex(b.targetLevel) - proficiencyIndex(a.targetLevel);
        })
        .slice(0, 3);

      recommendationsBySkillId.set(skillId, deduped);
    }

    return recommendationsBySkillId;
  }

  private computeFromMaps(
    requiredSkillIds: string[],
    requiredLevel: ProficiencyLevel,
    skillsById: Map<string, Skill>,
    currentLevelBySkillId: Map<string, ProficiencyLevel>,
    recommendationsBySkillId: Map<string, CourseRecommendation[]>,
  ): SkillGapComputationResult {
    let achievedWeight = 0;
    let requiredWeight = 0;

    const matchedSkills: SkillGapItem[] = [];
    const missingSkills: SkillGapItem[] = [];
    const underLeveledSkills: SkillGapItem[] = [];

    for (const skillId of requiredSkillIds) {
      const skill = skillsById.get(skillId);
      const currentLevel = currentLevelBySkillId.get(skillId) ?? null;
      const requiredIndex = proficiencyIndex(requiredLevel);
      const currentIndex =
        currentLevel !== null ? proficiencyIndex(currentLevel) : -1;

      requiredWeight += requiredIndex + 1;
      if (currentIndex >= 0) {
        achievedWeight += Math.min(currentIndex + 1, requiredIndex + 1);
      }

      let status: SkillGapStatus = 'matched';
      if (currentLevel === null) {
        status = 'missing';
      } else if (currentIndex < requiredIndex) {
        status = 'under_leveled';
      }

      const item: SkillGapItem = {
        skillId,
        skillCode: skill?.code ?? '',
        skillName: skill?.name ?? '',
        requiredLevel,
        currentLevel,
        gapLevels: Math.max(0, requiredIndex - currentIndex),
        status,
        recommendations: recommendationsBySkillId.get(skillId) ?? [],
      };

      if (status === 'matched') {
        matchedSkills.push(item);
      } else if (status === 'missing') {
        missingSkills.push(item);
      } else {
        underLeveledSkills.push(item);
      }
    }

    const readinessPercent =
      requiredWeight > 0 ? Math.round((achievedWeight / requiredWeight) * 100) : 100;

    const recommendedCourseIds = Array.from(
      new Set(
        [...missingSkills, ...underLeveledSkills].flatMap((skill) =>
          skill.recommendations.map((course) => course.courseId),
        ),
      ),
    );

    return {
      readinessPercent,
      requiredSkillsCount: requiredSkillIds.length,
      matchedSkillsCount: matchedSkills.length,
      missingSkillsCount: missingSkills.length,
      underLeveledSkillsCount: underLeveledSkills.length,
      matchedSkills,
      missingSkills,
      underLeveledSkills,
      recommendedCourseIds,
    };
  }
}
