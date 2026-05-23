import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkplacePlacement, PlacementStatus } from './entities/workplace-placement.entity.js';
import { CreateWorkplacePlacementDto, UpdateWorkplacePlacementDto } from './dto/workplace-placement.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class WorkplacePlacementsService {
  constructor(
    @InjectRepository(WorkplacePlacement)
    private readonly repo: Repository<WorkplacePlacement>,
  ) {}

  async create(tenantId: string, dto: CreateWorkplacePlacementDto): Promise<WorkplacePlacement> {
    const placement = this.repo.create({ tenantId, ...dto } as Partial<WorkplacePlacement>);
    return this.repo.save(placement);
  }

  async findAll(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<WorkplacePlacement>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<WorkplacePlacement> {
    const placement = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['logs', 'supervisorAssessments', 'competencySignOffs'],
    });
    if (!placement) {
      throw new NotFoundException(`Workplace placement "${id}" not found`);
    }
    return placement;
  }

  async findByStudent(tenantId: string, studentProfileId: string): Promise<WorkplacePlacement[]> {
    return this.repo.find({
      where: { tenantId, studentProfileId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateWorkplacePlacementDto): Promise<WorkplacePlacement> {
    const placement = await this.findOne(tenantId, id);
    Object.assign(placement, dto);
    return this.repo.save(placement);
  }

  async complete(tenantId: string, id: string): Promise<WorkplacePlacement> {
    const placement = await this.findOne(tenantId, id);
    placement.status = PlacementStatus.COMPLETED;
    placement.completedAt = new Date();
    return this.repo.save(placement);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const placement = await this.findOne(tenantId, id);
    await this.repo.remove(placement);
  }
}
