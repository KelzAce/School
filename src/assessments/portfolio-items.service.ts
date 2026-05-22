import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioItem } from './entities/portfolio-item.entity.js';
import {
  CreatePortfolioItemDto,
  UpdatePortfolioItemDto,
} from './dto/portfolio-item.dto.js';

@Injectable()
export class PortfolioItemsService {
  constructor(
    @InjectRepository(PortfolioItem)
    private readonly itemRepo: Repository<PortfolioItem>,
  ) {}

  async create(
    tenantId: string,
    dto: CreatePortfolioItemDto,
  ): Promise<PortfolioItem> {
    const item = this.itemRepo.create({
      tenantId,
      portfolioId: dto.portfolioId,
      type: dto.type,
      title: dto.title,
      description: dto.description ?? null,
      fileUrl: dto.fileUrl ?? null,
      externalUrl: dto.externalUrl ?? null,
      metadata: dto.metadata ?? null,
      tags: dto.tags ?? [],
      sortOrder: dto.sortOrder ?? 0,
    } as Partial<PortfolioItem>);
    return this.itemRepo.save(item);
  }

  async findByPortfolio(
    tenantId: string,
    portfolioId: string,
  ): Promise<PortfolioItem[]> {
    return this.itemRepo.find({
      where: { tenantId, portfolioId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<PortfolioItem> {
    const item = await this.itemRepo.findOne({ where: { id, tenantId } });
    if (!item) {
      throw new NotFoundException(`Portfolio item "${id}" not found`);
    }
    return item;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdatePortfolioItemDto,
  ): Promise<PortfolioItem> {
    const item = await this.findOne(tenantId, id);
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const item = await this.findOne(tenantId, id);
    await this.itemRepo.remove(item);
  }
}
