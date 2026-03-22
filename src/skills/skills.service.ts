import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Skill } from './entities/skill.entity.js';
import { CreateSkillDto } from './dto/create-skill.dto.js';
import { UpdateSkillDto } from './dto/update-skill.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
  ) {}

  async create(tenantId: string, dto: CreateSkillDto): Promise<Skill> {
    const existing = await this.skillRepo.findOne({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Skill code "${dto.code}" already exists in this tenant`,
      );
    }

    const skill = this.skillRepo.create({
      ...dto,
      tenantId,
    } as Partial<Skill>);
    return this.skillRepo.save(skill);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
    categoryId?: string,
    type?: string,
  ): Promise<PaginatedResult<Skill>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Skill> = { tenantId };
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type as Skill['type'];

    const [data, total] = await this.skillRepo.findAndCount({
      where,
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Skill> {
    const skill = await this.skillRepo.findOne({
      where: { id, tenantId },
      relations: ['category', 'children', 'courseSkills', 'courseSkills.course'],
    });
    if (!skill) {
      throw new NotFoundException(`Skill with id "${id}" not found`);
    }
    return skill;
  }

  async findByCategory(
    tenantId: string,
    categoryId: string,
  ): Promise<Skill[]> {
    return this.skillRepo.find({
      where: { tenantId, categoryId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateSkillDto,
  ): Promise<Skill> {
    const skill = await this.findOne(tenantId, id);

    if (dto.code && dto.code !== skill.code) {
      const taken = await this.skillRepo.findOne({
        where: { tenantId, code: dto.code },
      });
      if (taken) {
        throw new ConflictException(
          `Skill code "${dto.code}" already exists in this tenant`,
        );
      }
    }

    Object.assign(skill, dto);
    return this.skillRepo.save(skill);
  }

  async remove(tenantId: string, id: string): Promise<Skill> {
    const skill = await this.findOne(tenantId, id);
    return this.skillRepo.remove(skill);
  }
}
