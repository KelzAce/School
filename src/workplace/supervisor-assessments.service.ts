import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupervisorAssessment } from './entities/supervisor-assessment.entity.js';
import { CreateSupervisorAssessmentDto, UpdateSupervisorAssessmentDto } from './dto/supervisor-assessment.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class SupervisorAssessmentsService {
  constructor(
    @InjectRepository(SupervisorAssessment)
    private readonly repo: Repository<SupervisorAssessment>,
  ) {}

  async create(tenantId: string, dto: CreateSupervisorAssessmentDto): Promise<SupervisorAssessment> {
    const assessment = this.repo.create({ tenantId, ...dto } as Partial<SupervisorAssessment>);
    return this.repo.save(assessment);
  }

  async findAll(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<SupervisorAssessment>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { assessedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<SupervisorAssessment> {
    const assessment = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['placement'],
    });
    if (!assessment) {
      throw new NotFoundException(`Supervisor assessment "${id}" not found`);
    }
    return assessment;
  }

  async findByPlacement(tenantId: string, placementId: string): Promise<SupervisorAssessment[]> {
    return this.repo.find({
      where: { tenantId, placementId },
      order: { assessedAt: 'DESC' },
    });
  }

  async findByStudent(tenantId: string, studentProfileId: string): Promise<SupervisorAssessment[]> {
    return this.repo.find({
      where: { tenantId, studentProfileId },
      order: { assessedAt: 'DESC' },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateSupervisorAssessmentDto): Promise<SupervisorAssessment> {
    const assessment = await this.findOne(tenantId, id);
    Object.assign(assessment, dto);
    return this.repo.save(assessment);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const assessment = await this.findOne(tenantId, id);
    await this.repo.remove(assessment);
  }
}
