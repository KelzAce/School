import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkillCategory } from './entities/skill-category.entity.js';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto.js';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class SkillCategoriesService {
  constructor(
    @InjectRepository(SkillCategory)
    private readonly categoryRepo: Repository<SkillCategory>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateSkillCategoryDto,
  ): Promise<SkillCategory> {
    const existing = await this.categoryRepo.findOne({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Skill category code "${dto.code}" already exists in this tenant`,
      );
    }

    const category = this.categoryRepo.create({ ...dto, tenantId });
    return this.categoryRepo.save(category);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<SkillCategory>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.categoryRepo.findAndCount({
      where: { tenantId },
      order: { sortOrder: 'ASC', name: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<SkillCategory> {
    const category = await this.categoryRepo.findOne({
      where: { id, tenantId },
      relations: ['skills'],
    });
    if (!category) {
      throw new NotFoundException(
        `Skill category with id "${id}" not found`,
      );
    }
    return category;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateSkillCategoryDto,
  ): Promise<SkillCategory> {
    const category = await this.findOne(tenantId, id);

    if (dto.code && dto.code !== category.code) {
      const taken = await this.categoryRepo.findOne({
        where: { tenantId, code: dto.code },
      });
      if (taken) {
        throw new ConflictException(
          `Skill category code "${dto.code}" already exists in this tenant`,
        );
      }
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(tenantId: string, id: string): Promise<SkillCategory> {
    const category = await this.findOne(tenantId, id);
    return this.categoryRepo.remove(category);
  }
}
