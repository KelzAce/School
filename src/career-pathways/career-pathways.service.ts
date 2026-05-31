import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CareerPathway } from './entities/career-pathway.entity.js';
import { CareerPathwaySkill } from './entities/career-pathway-skill.entity.js';
import { CreateCareerPathwayDto } from './dto/create-career-pathway.dto.js';
import { UpdateCareerPathwayDto } from './dto/update-career-pathway.dto.js';
import { AddPathwaySkillDto } from './dto/add-pathway-skill.dto.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';
import { User, UserRole } from '../users/entities/user.entity.js';

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

export interface SkillTreeNode {
  skillId: string;
  skillCode: string;
  skillName: string;
  skillType: string;
  requiredLevel: ProficiencyLevel;
  isCritical: boolean;
  sortOrder: number;
  children: SkillTreeNode[];
}

export interface StudentPathwayProgressResponse {
  studentProfileId: string;
  pathwayId: string;
  pathwayTitle: string;
  completionPercent: number;
  totalSkillsCount: number;
  masteredSkillsCount: number;
  inProgressSkillsCount: number;
  notStartedSkillsCount: number;
  skills: Array<{
    skillId: string;
    skillCode: string;
    skillName: string;
    requiredLevel: ProficiencyLevel;
    currentLevel: ProficiencyLevel | null;
    isCritical: boolean;
    status: 'mastered' | 'in_progress' | 'not_started';
    gapLevels: number;
    recommendedCourses: Array<{ courseId: string; courseCode: string; courseTitle: string }>;
  }>;
  nextSkills: string[];
}

export interface PathwaySuggestion {
  pathwayId: string;
  pathwayTitle: string;
  sector: string | null;
  completionPercent: number;
  totalSkillsCount: number;
  masteredSkillsCount: number;
}

@Injectable()
export class CareerPathwaysService {
  constructor(
    @InjectRepository(CareerPathway)
    private readonly pathwayRepo: Repository<CareerPathway>,
    @InjectRepository(CareerPathwaySkill)
    private readonly pathwaySkillRepo: Repository<CareerPathwaySkill>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(StudentProfile)
    private readonly studentRepo: Repository<StudentProfile>,
    @InjectRepository(StudentSkill)
    private readonly studentSkillRepo: Repository<StudentSkill>,
    @InjectRepository(MasteryRecord)
    private readonly masteryRepo: Repository<MasteryRecord>,
    @InjectRepository(CourseSkill)
    private readonly courseSkillRepo: Repository<CourseSkill>,
  ) {}

  async create(tenantId: string, dto: CreateCareerPathwayDto): Promise<CareerPathway> {
    const existing = await this.pathwayRepo.findOne({ where: { tenantId, slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`A pathway with slug "${dto.slug}" already exists`);
    }
    const pathway = this.pathwayRepo.create({
      tenantId,
      title: dto.title,
      slug: dto.slug,
      description: dto.description ?? null,
      sector: dto.sector ?? null,
      tags: dto.tags ?? [],
      isPublished: dto.isPublished ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.pathwayRepo.save(pathway);
  }

  async findAll(
    tenantId: string,
    options?: { sector?: string; isPublished?: boolean },
  ): Promise<CareerPathway[]> {
    const where: Record<string, unknown> = { tenantId };
    if (options?.sector !== undefined) where.sector = options.sector;
    if (options?.isPublished !== undefined) where.isPublished = options.isPublished;
    return this.pathwayRepo.find({ where, order: { sortOrder: 'ASC', title: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<CareerPathway> {
    const pathway = await this.pathwayRepo.findOne({
      where: { id, tenantId },
      relations: ['pathwaySkills', 'pathwaySkills.skill'],
    });
    if (!pathway) {
      throw new NotFoundException(`Career pathway "${id}" not found`);
    }
    return pathway;
  }

  async update(tenantId: string, id: string, dto: UpdateCareerPathwayDto): Promise<CareerPathway> {
    const pathway = await this.pathwayRepo.findOne({ where: { id, tenantId } });
    if (!pathway) {
      throw new NotFoundException(`Career pathway "${id}" not found`);
    }
    if (dto.slug && dto.slug !== pathway.slug) {
      const existing = await this.pathwayRepo.findOne({ where: { tenantId, slug: dto.slug } });
      if (existing) {
        throw new ConflictException(`A pathway with slug "${dto.slug}" already exists`);
      }
    }
    Object.assign(pathway, dto);
    return this.pathwayRepo.save(pathway);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const pathway = await this.pathwayRepo.findOne({ where: { id, tenantId } });
    if (!pathway) {
      throw new NotFoundException(`Career pathway "${id}" not found`);
    }
    await this.pathwayRepo.remove(pathway);
  }

  async addSkill(
    tenantId: string,
    pathwayId: string,
    dto: AddPathwaySkillDto,
  ): Promise<CareerPathwaySkill> {
    const pathway = await this.pathwayRepo.findOne({ where: { id: pathwayId, tenantId } });
    if (!pathway) {
      throw new NotFoundException(`Career pathway "${pathwayId}" not found`);
    }
    const skill = await this.skillRepo.findOne({ where: { id: dto.skillId, tenantId } });
    if (!skill) {
      throw new NotFoundException(`Skill "${dto.skillId}" not found`);
    }
    const existing = await this.pathwaySkillRepo.findOne({
      where: { pathwayId, skillId: dto.skillId },
    });
    if (existing) {
      throw new ConflictException(`Skill "${dto.skillId}" is already mapped to this pathway`);
    }
    const pathwaySkill = this.pathwaySkillRepo.create({
      tenantId,
      pathwayId,
      skillId: dto.skillId,
      requiredLevel: dto.requiredLevel,
      isCritical: dto.isCritical ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.pathwaySkillRepo.save(pathwaySkill);
  }

  async removeSkill(tenantId: string, pathwayId: string, skillId: string): Promise<void> {
    const pathwaySkill = await this.pathwaySkillRepo.findOne({
      where: { pathwayId, skillId, tenantId },
    });
    if (!pathwaySkill) {
      throw new NotFoundException(`Skill "${skillId}" is not mapped to pathway "${pathwayId}"`);
    }
    await this.pathwaySkillRepo.remove(pathwaySkill);
  }

  async getSkillTree(tenantId: string, pathwayId: string): Promise<SkillTreeNode[]> {
    const pathway = await this.pathwayRepo.findOne({ where: { id: pathwayId, tenantId } });
    if (!pathway) {
      throw new NotFoundException(`Career pathway "${pathwayId}" not found`);
    }
    const pathwaySkills = await this.pathwaySkillRepo.find({
      where: { pathwayId, tenantId },
      relations: ['skill'],
      order: { sortOrder: 'ASC' },
    });
    if (pathwaySkills.length === 0) {
      return [];
    }

    const skillIds = new Set(pathwaySkills.map((ps) => ps.skillId));
    const nodeBySkillId = new Map<string, SkillTreeNode>();

    for (const ps of pathwaySkills) {
      nodeBySkillId.set(ps.skillId, {
        skillId: ps.skillId,
        skillCode: ps.skill.code,
        skillName: ps.skill.name,
        skillType: ps.skill.type,
        requiredLevel: ps.requiredLevel,
        isCritical: ps.isCritical,
        sortOrder: ps.sortOrder,
        children: [],
      });
    }

    const rootNodes: SkillTreeNode[] = [];
    for (const ps of pathwaySkills) {
      const node = nodeBySkillId.get(ps.skillId)!;
      const parentId = ps.skill.parentId;
      if (parentId && skillIds.has(parentId)) {
        nodeBySkillId.get(parentId)!.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    return rootNodes;
  }

  async getStudentProgress(
    tenantId: string,
    studentProfileId: string,
    pathwayId: string,
    requester?: User,
  ): Promise<StudentPathwayProgressResponse> {
    await this.validateStudentAccess(tenantId, studentProfileId, requester);

    const pathway = await this.pathwayRepo.findOne({ where: { id: pathwayId, tenantId } });
    if (!pathway) {
      throw new NotFoundException(`Career pathway "${pathwayId}" not found`);
    }

    const pathwaySkills = await this.pathwaySkillRepo.find({
      where: { pathwayId, tenantId },
      relations: ['skill'],
      order: { sortOrder: 'ASC' },
    });

    if (pathwaySkills.length === 0) {
      return {
        studentProfileId,
        pathwayId,
        pathwayTitle: pathway.title,
        completionPercent: 0,
        totalSkillsCount: 0,
        masteredSkillsCount: 0,
        inProgressSkillsCount: 0,
        notStartedSkillsCount: 0,
        skills: [],
        nextSkills: [],
      };
    }

    const skillIds = pathwaySkills.map((ps) => ps.skillId);
    const [studentSkills, masteryRecords, courseSkills] = await Promise.all([
      this.studentSkillRepo.find({ where: { tenantId, studentProfileId, skillId: In(skillIds) } }),
      this.masteryRepo.find({ where: { tenantId, studentProfileId, skillId: In(skillIds) } }),
      this.courseSkillRepo.find({ where: { tenantId, skillId: In(skillIds) }, relations: ['course'] }),
    ]);

    const currentLevelBySkillId = new Map<string, ProficiencyLevel>();
    for (const ss of studentSkills) {
      currentLevelBySkillId.set(ss.skillId, ss.currentLevel);
    }
    for (const mr of masteryRecords) {
      const existing = currentLevelBySkillId.get(mr.skillId);
      if (!existing || proficiencyIndex(mr.level) > proficiencyIndex(existing)) {
        currentLevelBySkillId.set(mr.skillId, mr.level);
      }
    }

    const courseRecsBySkillId = new Map<string, Array<{ courseId: string; courseCode: string; courseTitle: string }>>();
    for (const cs of courseSkills) {
      if (!courseRecsBySkillId.has(cs.skillId)) {
        courseRecsBySkillId.set(cs.skillId, []);
      }
      courseRecsBySkillId.get(cs.skillId)!.push({
        courseId: cs.courseId,
        courseCode: cs.course?.code ?? '',
        courseTitle: cs.course?.title ?? '',
      });
    }

    let masteredCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    let achievedWeight = 0;
    let requiredWeight = 0;

    const skillsResult = pathwaySkills.map((ps) => {
      const currentLevel = currentLevelBySkillId.get(ps.skillId) ?? null;
      const requiredIdx = proficiencyIndex(ps.requiredLevel);
      const currentIdx = currentLevel !== null ? proficiencyIndex(currentLevel) : -1;

      requiredWeight += requiredIdx + 1;
      if (currentIdx >= 0) {
        achievedWeight += Math.min(currentIdx + 1, requiredIdx + 1);
      }

      let status: 'mastered' | 'in_progress' | 'not_started';
      if (currentIdx >= requiredIdx) {
        status = 'mastered';
        masteredCount++;
      } else if (currentIdx >= 0) {
        status = 'in_progress';
        inProgressCount++;
      } else {
        status = 'not_started';
        notStartedCount++;
      }

      return {
        skillId: ps.skillId,
        skillCode: ps.skill.code,
        skillName: ps.skill.name,
        requiredLevel: ps.requiredLevel,
        currentLevel,
        isCritical: ps.isCritical,
        status,
        gapLevels: Math.max(0, requiredIdx - currentIdx),
        recommendedCourses: (courseRecsBySkillId.get(ps.skillId) ?? []).slice(0, 3),
      };
    });

    const completionPercent =
      requiredWeight > 0 ? Math.round((achievedWeight / requiredWeight) * 100) : 0;

    const nextSkills = skillsResult
      .filter((s) => s.status !== 'mastered')
      .sort((a, b) => {
        if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
        return a.gapLevels - b.gapLevels;
      })
      .slice(0, 5)
      .map((s) => s.skillId);

    return {
      studentProfileId,
      pathwayId,
      pathwayTitle: pathway.title,
      completionPercent,
      totalSkillsCount: pathwaySkills.length,
      masteredSkillsCount: masteredCount,
      inProgressSkillsCount: inProgressCount,
      notStartedSkillsCount: notStartedCount,
      skills: skillsResult,
      nextSkills,
    };
  }

  async getStudentSuggestions(
    tenantId: string,
    studentProfileId: string,
    requester?: User,
  ): Promise<PathwaySuggestion[]> {
    await this.validateStudentAccess(tenantId, studentProfileId, requester);

    const [publishedPathways, studentSkills, masteryRecords] = await Promise.all([
      this.pathwayRepo.find({
        where: { tenantId, isPublished: true },
        order: { sortOrder: 'ASC', title: 'ASC' },
      }),
      this.studentSkillRepo.find({ where: { tenantId, studentProfileId } }),
      this.masteryRepo.find({ where: { tenantId, studentProfileId } }),
    ]);

    if (publishedPathways.length === 0) {
      return [];
    }

    const currentLevelBySkillId = new Map<string, ProficiencyLevel>();
    for (const ss of studentSkills) {
      currentLevelBySkillId.set(ss.skillId, ss.currentLevel);
    }
    for (const mr of masteryRecords) {
      const existing = currentLevelBySkillId.get(mr.skillId);
      if (!existing || proficiencyIndex(mr.level) > proficiencyIndex(existing)) {
        currentLevelBySkillId.set(mr.skillId, mr.level);
      }
    }

    const pathwayIds = publishedPathways.map((p) => p.id);
    const allPathwaySkills = await this.pathwaySkillRepo.find({
      where: { tenantId, pathwayId: In(pathwayIds) },
    });

    const skillsByPathwayId = new Map<string, CareerPathwaySkill[]>();
    for (const ps of allPathwaySkills) {
      if (!skillsByPathwayId.has(ps.pathwayId)) {
        skillsByPathwayId.set(ps.pathwayId, []);
      }
      skillsByPathwayId.get(ps.pathwayId)!.push(ps);
    }

    const suggestions = publishedPathways.map((pathway) => {
      const pathwaySkills = skillsByPathwayId.get(pathway.id) ?? [];
      let achievedWeight = 0;
      let requiredWeight = 0;
      let masteredCount = 0;

      for (const ps of pathwaySkills) {
        const requiredIdx = proficiencyIndex(ps.requiredLevel);
        const currentLevel = currentLevelBySkillId.get(ps.skillId) ?? null;
        const currentIdx = currentLevel !== null ? proficiencyIndex(currentLevel) : -1;

        requiredWeight += requiredIdx + 1;
        if (currentIdx >= 0) {
          achievedWeight += Math.min(currentIdx + 1, requiredIdx + 1);
        }
        if (currentIdx >= requiredIdx) {
          masteredCount++;
        }
      }

      const completionPercent =
        requiredWeight > 0 ? Math.round((achievedWeight / requiredWeight) * 100) : 0;

      return {
        pathwayId: pathway.id,
        pathwayTitle: pathway.title,
        sector: pathway.sector,
        completionPercent,
        totalSkillsCount: pathwaySkills.length,
        masteredSkillsCount: masteredCount,
      };
    });

    return suggestions.sort((a, b) => b.completionPercent - a.completionPercent);
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
      throw new ForbiddenException('Students can only view their own career pathway progress');
    }
    return studentProfile;
  }
}
