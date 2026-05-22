import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioRubric } from './entities/portfolio-rubric.entity.js';
import { PortfolioRubricCriterion } from './entities/portfolio-rubric-criterion.entity.js';
import {
  CreatePortfolioRubricDto,
  UpdatePortfolioRubricDto,
} from './dto/portfolio-rubric.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class PortfolioRubricsService {
  constructor(
    @InjectRepository(PortfolioRubric)
    private readonly rubricRepo: Repository<PortfolioRubric>,
    @InjectRepository(PortfolioRubricCriterion)
    private readonly criterionRepo: Repository<PortfolioRubricCriterion>,
  ) {}

  async create(
    tenantId: string,
    dto: CreatePortfolioRubricDto,
  ): Promise<PortfolioRubric> {
    const rubric = this.rubricRepo.create({
      tenantId,
      name: dto.name,
      description: dto.description ?? null,
      courseId: dto.courseId ?? null,
    } as Partial<PortfolioRubric>);
    const savedRubric = await this.rubricRepo.save(rubric);

    const criteria = dto.criteria.map((c, index) =>
      this.criterionRepo.create({
        rubricId: savedRubric.id,
        name: c.name,
        description: c.description ?? null,
        maxScore: c.maxScore,
        weight: c.weight ?? 1.0,
        sortOrder: c.sortOrder ?? index,
      } as Partial<PortfolioRubricCriterion>),
    );
    savedRubric.criteria = await this.criterionRepo.save(criteria);

    return savedRubric;
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PortfolioRubric>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.rubricRepo.findAndCount({
      where: { tenantId },
      relations: ['criteria'],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<PortfolioRubric> {
    const rubric = await this.rubricRepo.findOne({
      where: { id, tenantId },
      relations: ['criteria'],
    });
    if (!rubric) {
      throw new NotFoundException(`Portfolio rubric "${id}" not found`);
    }
    return rubric;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePortfolioRubricDto,
  ): Promise<PortfolioRubric> {
    const rubric = await this.findOne(tenantId, id);
    Object.assign(rubric, dto);
    return this.rubricRepo.save(rubric);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const rubric = await this.findOne(tenantId, id);
    await this.rubricRepo.remove(rubric);
  }
}
