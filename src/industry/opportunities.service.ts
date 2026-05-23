import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Opportunity, OpportunityType, OpportunityStatus } from './entities/opportunity.entity.js';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from './dto/opportunity.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly repo: Repository<Opportunity>,
  ) {}

  async create(tenantId: string, dto: CreateOpportunityDto): Promise<Opportunity> {
    const opportunity = this.repo.create({
      tenantId,
      ...dto,
      applicationDeadline: dto.applicationDeadline ? new Date(dto.applicationDeadline) : null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
    } as Partial<Opportunity>);
    return this.repo.save(opportunity);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto & { type?: OpportunityType; status?: OpportunityStatus },
  ): Promise<PaginatedResult<Opportunity>> {
    const { page = 1, limit = 20, type, status } = query;
    const where: FindOptionsWhere<Opportunity> = { tenantId };
    if (type) where.type = type;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<Opportunity> {
    const opportunity = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['partner'],
    });
    if (!opportunity) {
      throw new NotFoundException(`Opportunity "${id}" not found`);
    }
    return opportunity;
  }

  async findByPartner(tenantId: string, partnerId: string): Promise<Opportunity[]> {
    return this.repo.find({ where: { tenantId, partnerId }, order: { createdAt: 'DESC' } });
  }

  async update(tenantId: string, id: string, dto: UpdateOpportunityDto): Promise<Opportunity> {
    const opportunity = await this.findOne(tenantId, id);
    Object.assign(opportunity, dto);
    return this.repo.save(opportunity);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const opportunity = await this.findOne(tenantId, id);
    await this.repo.remove(opportunity);
  }
}
