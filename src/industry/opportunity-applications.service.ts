import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpportunityApplication, ApplicationStatus } from './entities/opportunity-application.entity.js';
import {
  CreateOpportunityApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/opportunity-application.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class OpportunityApplicationsService {
  constructor(
    @InjectRepository(OpportunityApplication)
    private readonly repo: Repository<OpportunityApplication>,
  ) {}

  async create(tenantId: string, dto: CreateOpportunityApplicationDto): Promise<OpportunityApplication> {
    const existing = await this.repo.findOne({
      where: {
        tenantId,
        opportunityId: dto.opportunityId,
        studentProfileId: dto.studentProfileId,
      },
    });
    if (existing) {
      throw new ConflictException('Student has already applied to this opportunity');
    }
    const application = this.repo.create({ tenantId, ...dto } as Partial<OpportunityApplication>);
    return this.repo.save(application);
  }

  async findAll(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<OpportunityApplication>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<OpportunityApplication> {
    const application = await this.repo.findOne({ where: { id, tenantId } });
    if (!application) {
      throw new NotFoundException(`Application "${id}" not found`);
    }
    return application;
  }

  async findByOpportunity(tenantId: string, opportunityId: string): Promise<OpportunityApplication[]> {
    return this.repo.find({ where: { tenantId, opportunityId }, order: { createdAt: 'DESC' } });
  }

  async findByStudent(tenantId: string, studentProfileId: string): Promise<OpportunityApplication[]> {
    return this.repo.find({ where: { tenantId, studentProfileId }, order: { createdAt: 'DESC' } });
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateApplicationStatusDto): Promise<OpportunityApplication> {
    const application = await this.findOne(tenantId, id);
    application.status = dto.status;
    if (dto.notes !== undefined) application.notes = dto.notes ?? null;
    if (dto.reviewedBy !== undefined) application.reviewedBy = dto.reviewedBy ?? null;
    application.reviewedAt = new Date();
    return this.repo.save(application);
  }

  async withdraw(tenantId: string, id: string): Promise<OpportunityApplication> {
    const application = await this.findOne(tenantId, id);
    application.status = ApplicationStatus.WITHDRAWN;
    return this.repo.save(application);
  }
}
