import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkplaceLog } from './entities/workplace-log.entity.js';
import { WorkplacePlacement } from './entities/workplace-placement.entity.js';
import { CreateWorkplaceLogDto, UpdateWorkplaceLogDto, ReviewLogDto } from './dto/workplace-log.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class WorkplaceLogsService {
  constructor(
    @InjectRepository(WorkplaceLog)
    private readonly repo: Repository<WorkplaceLog>,
    @InjectRepository(WorkplacePlacement)
    private readonly placementRepo: Repository<WorkplacePlacement>,
  ) {}

  async create(tenantId: string, dto: CreateWorkplaceLogDto): Promise<WorkplaceLog> {
    const log = this.repo.create({ tenantId, ...dto } as Partial<WorkplaceLog>);
    const saved = await this.repo.save(log);

    const placement = await this.placementRepo.findOne({
      where: { id: dto.placementId, tenantId },
    });
    if (placement) {
      placement.totalHoursLogged = Number(placement.totalHoursLogged) + Number(dto.hoursWorked);
      await this.placementRepo.save(placement);
    }

    return saved;
  }

  async findAll(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<WorkplaceLog>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { logDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<WorkplaceLog> {
    const log = await this.repo.findOne({ where: { id, tenantId } });
    if (!log) {
      throw new NotFoundException(`Workplace log "${id}" not found`);
    }
    return log;
  }

  async findByPlacement(tenantId: string, placementId: string): Promise<WorkplaceLog[]> {
    return this.repo.find({
      where: { tenantId, placementId },
      order: { logDate: 'DESC' },
    });
  }

  async findByStudent(tenantId: string, studentProfileId: string): Promise<WorkplaceLog[]> {
    return this.repo.find({
      where: { tenantId, studentProfileId },
      order: { logDate: 'DESC' },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateWorkplaceLogDto): Promise<WorkplaceLog> {
    const log = await this.findOne(tenantId, id);
    Object.assign(log, dto);
    return this.repo.save(log);
  }

  async review(tenantId: string, id: string, dto: ReviewLogDto): Promise<WorkplaceLog> {
    const log = await this.findOne(tenantId, id);
    log.status = dto.status;
    log.supervisorFeedback = dto.supervisorFeedback ?? null;
    log.reviewedBy = dto.reviewedBy;
    log.reviewedAt = new Date();
    return this.repo.save(log);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const log = await this.findOne(tenantId, id);
    await this.repo.remove(log);
  }
}
