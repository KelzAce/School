import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio, PortfolioStatus } from './entities/portfolio.entity.js';
import {
  CreatePortfolioDto,
  UpdatePortfolioDto,
} from './dto/portfolio.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
  ) {}

  async create(tenantId: string, dto: CreatePortfolioDto): Promise<Portfolio> {
    const portfolio = this.portfolioRepo.create({
      tenantId,
      studentProfileId: dto.studentProfileId,
      courseId: dto.courseId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      tags: dto.tags ?? [],
    } as Partial<Portfolio>);
    return this.portfolioRepo.save(portfolio);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Portfolio>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.portfolioRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepo.findOne({
      where: { id, tenantId },
      relations: ['items', 'assessments'],
    });
    if (!portfolio) {
      throw new NotFoundException(`Portfolio "${id}" not found`);
    }
    return portfolio;
  }

  async findByStudent(
    tenantId: string,
    studentProfileId: string,
  ): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      where: { tenantId, studentProfileId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePortfolioDto,
  ): Promise<Portfolio> {
    const portfolio = await this.findOne(tenantId, id);
    Object.assign(portfolio, dto);
    return this.portfolioRepo.save(portfolio);
  }

  async submit(tenantId: string, id: string): Promise<Portfolio> {
    const portfolio = await this.findOne(tenantId, id);
    portfolio.status = PortfolioStatus.SUBMITTED;
    portfolio.submittedAt = new Date();
    return this.portfolioRepo.save(portfolio);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const portfolio = await this.findOne(tenantId, id);
    await this.portfolioRepo.remove(portfolio);
  }
}
