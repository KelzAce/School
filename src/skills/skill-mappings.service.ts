import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSkill } from './entities/course-skill.entity.js';
import { CreateCourseSkillDto } from './dto/create-course-skill.dto.js';
import { StudentSkill } from './entities/student-skill.entity.js';
import { CreateStudentSkillDto } from './dto/create-student-skill.dto.js';
import { UpdateStudentSkillDto } from './dto/update-student-skill.dto.js';
import { ProficiencyLevel } from './entities/skill-enums.js';

@Injectable()
export class SkillMappingsService {
  constructor(
    @InjectRepository(CourseSkill)
    private readonly courseSkillRepo: Repository<CourseSkill>,
    @InjectRepository(StudentSkill)
    private readonly studentSkillRepo: Repository<StudentSkill>,
  ) {}

  /* ---- Course-Skill mappings ---- */

  async mapSkillToCourse(
    tenantId: string,
    dto: CreateCourseSkillDto,
  ): Promise<CourseSkill> {
    const existing = await this.courseSkillRepo.findOne({
      where: { tenantId, courseId: dto.courseId, skillId: dto.skillId },
    });
    if (existing) {
      throw new ConflictException(
        'This skill is already mapped to this course',
      );
    }

    const mapping = this.courseSkillRepo.create({
      ...dto,
      tenantId,
    } as Partial<CourseSkill>);
    return this.courseSkillRepo.save(mapping);
  }

  async findSkillsByCourse(
    tenantId: string,
    courseId: string,
  ): Promise<CourseSkill[]> {
    return this.courseSkillRepo.find({
      where: { tenantId, courseId },
      relations: ['skill', 'skill.category'],
      order: { isPrimary: 'DESC' },
    });
  }

  async findCoursesBySkill(
    tenantId: string,
    skillId: string,
  ): Promise<CourseSkill[]> {
    return this.courseSkillRepo.find({
      where: { tenantId, skillId },
      relations: ['course'],
    });
  }

  async removeCourseSkill(tenantId: string, id: string): Promise<void> {
    const mapping = await this.courseSkillRepo.findOne({
      where: { id, tenantId },
    });
    if (!mapping) {
      throw new NotFoundException(
        `Course-skill mapping with id "${id}" not found`,
      );
    }
    await this.courseSkillRepo.remove(mapping);
  }

  /* ---- Student-Skill records ---- */

  async recordStudentSkill(
    tenantId: string,
    dto: CreateStudentSkillDto,
  ): Promise<StudentSkill> {
    const existing = await this.studentSkillRepo.findOne({
      where: {
        tenantId,
        studentProfileId: dto.studentProfileId,
        skillId: dto.skillId,
      },
    });
    if (existing) {
      throw new ConflictException(
        'This student already has a record for this skill',
      );
    }

    const record = this.studentSkillRepo.create({
      ...dto,
      tenantId,
      verifiedAt: dto.verifiedBy ? new Date() : null,
    } as Partial<StudentSkill>);
    return this.studentSkillRepo.save(record);
  }

  async findSkillsByStudent(
    tenantId: string,
    studentProfileId: string,
  ): Promise<StudentSkill[]> {
    return this.studentSkillRepo.find({
      where: { tenantId, studentProfileId },
      relations: ['skill', 'skill.category'],
      order: { skill: { category: { sortOrder: 'ASC' } } },
    });
  }

  async updateStudentSkill(
    tenantId: string,
    id: string,
    dto: UpdateStudentSkillDto,
  ): Promise<StudentSkill> {
    const record = await this.studentSkillRepo.findOne({
      where: { id, tenantId },
    });
    if (!record) {
      throw new NotFoundException(
        `Student skill record with id "${id}" not found`,
      );
    }

    if (dto.currentLevel) {
      record.currentLevel = dto.currentLevel as ProficiencyLevel;
    }
    if (dto.verifiedBy !== undefined) {
      record.verifiedBy = dto.verifiedBy;
      record.verifiedAt = dto.verifiedBy ? new Date() : null;
    }
    if (dto.notes !== undefined) {
      record.notes = dto.notes;
    }

    return this.studentSkillRepo.save(record);
  }
}
