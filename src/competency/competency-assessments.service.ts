import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CompetencyAssessment,
  AssessmentResult,
} from './entities/competency-assessment.entity.js';
import { MasteryRecord } from './entities/mastery-record.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';
import { CreateCompetencyAssessmentDto } from './dto/create-competency-assessment.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

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

@Injectable()
export class CompetencyAssessmentsService {
  constructor(
    @InjectRepository(CompetencyAssessment)
    private readonly assessmentRepo: Repository<CompetencyAssessment>,
    @InjectRepository(MasteryRecord)
    private readonly masteryRepo: Repository<MasteryRecord>,
    @InjectRepository(StudentSkill)
    private readonly studentSkillRepo: Repository<StudentSkill>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateCompetencyAssessmentDto,
  ): Promise<CompetencyAssessment> {
    const percentage = (dto.score / dto.maxScore) * 100;
    const result =
      percentage >= 80
        ? AssessmentResult.ADVANCED
        : percentage >= 60
          ? AssessmentResult.COMPETENT
          : AssessmentResult.NOT_YET_COMPETENT;

    const assessment = this.assessmentRepo.create({
      tenantId,
      ...dto,
      result,
    } as Partial<CompetencyAssessment>);
    const saved = await this.assessmentRepo.save(assessment);

    if (result !== AssessmentResult.NOT_YET_COMPETENT) {
      await this.recordMastery(tenantId, dto, saved);
    }

    return saved;
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CompetencyAssessment>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.assessmentRepo.findAndCount({
      where: { tenantId },
      relations: ['skill', 'course', 'studentProfile'],
      order: { assessedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(
    tenantId: string,
    id: string,
  ): Promise<CompetencyAssessment> {
    const assessment = await this.assessmentRepo.findOne({
      where: { id, tenantId },
      relations: ['skill', 'course', 'studentProfile'],
    });
    if (!assessment) {
      throw new NotFoundException(`Competency assessment "${id}" not found`);
    }
    return assessment;
  }

  async findByStudent(
    tenantId: string,
    studentProfileId: string,
  ): Promise<CompetencyAssessment[]> {
    return this.assessmentRepo.find({
      where: { tenantId, studentProfileId },
      relations: ['skill', 'course'],
      order: { assessedAt: 'DESC' },
    });
  }

  async findByStudentAndSkill(
    tenantId: string,
    studentProfileId: string,
    skillId: string,
  ): Promise<CompetencyAssessment[]> {
    return this.assessmentRepo.find({
      where: { tenantId, studentProfileId, skillId },
      relations: ['skill', 'course'],
      order: { assessedAt: 'ASC' },
    });
  }

  private async recordMastery(
    tenantId: string,
    dto: CreateCompetencyAssessmentDto,
    assessment: CompetencyAssessment,
  ): Promise<void> {
    const existing = await this.masteryRepo.findOne({
      where: {
        tenantId,
        studentProfileId: dto.studentProfileId,
        skillId: dto.skillId,
        level: dto.demonstratedLevel,
      },
    });
    if (!existing) {
      const record = this.masteryRepo.create({
        tenantId,
        studentProfileId: dto.studentProfileId,
        skillId: dto.skillId,
        level: dto.demonstratedLevel,
        assessmentId: assessment.id,
      } as Partial<MasteryRecord>);
      await this.masteryRepo.save(record);
    }

    // Update StudentSkill if new level is higher
    let studentSkill = await this.studentSkillRepo.findOne({
      where: {
        tenantId,
        studentProfileId: dto.studentProfileId,
        skillId: dto.skillId,
      },
    });

    if (!studentSkill) {
      studentSkill = this.studentSkillRepo.create({
        tenantId,
        studentProfileId: dto.studentProfileId,
        skillId: dto.skillId,
        currentLevel: dto.demonstratedLevel,
        verifiedBy: dto.assessedBy ?? null,
        verifiedAt: new Date(),
      } as Partial<StudentSkill>);
      await this.studentSkillRepo.save(studentSkill);
    } else if (
      proficiencyIndex(dto.demonstratedLevel) >
      proficiencyIndex(studentSkill.currentLevel)
    ) {
      studentSkill.currentLevel = dto.demonstratedLevel;
      studentSkill.verifiedBy = dto.assessedBy ?? null;
      studentSkill.verifiedAt = new Date();
      await this.studentSkillRepo.save(studentSkill);
    }
  }
}
