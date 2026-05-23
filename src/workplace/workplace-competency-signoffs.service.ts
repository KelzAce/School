import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkplaceCompetencySignOff } from './entities/workplace-competency-signoff.entity.js';
import { CreateWorkplaceCompetencySignOffDto } from './dto/workplace-competency-signoff.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class WorkplaceCompetencySignOffsService {
  constructor(
    @InjectRepository(WorkplaceCompetencySignOff)
    private readonly repo: Repository<WorkplaceCompetencySignOff>,
  ) {}

  async create(tenantId: string, dto: CreateWorkplaceCompetencySignOffDto): Promise<WorkplaceCompetencySignOff> {
    const existing = await this.repo.findOne({
      where: { tenantId, placementId: dto.placementId, skillId: dto.skillId },
    });
    if (existing) {
      throw new ConflictException(`Competency sign-off for skill "${dto.skillId}" already exists on this placement`);
    }
    const signOff = this.repo.create({ tenantId, ...dto } as Partial<WorkplaceCompetencySignOff>);
    return this.repo.save(signOff);
  }

  async findAll(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<WorkplaceCompetencySignOff>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { signedOffAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<WorkplaceCompetencySignOff> {
    const signOff = await this.repo.findOne({ where: { id, tenantId } });
    if (!signOff) {
      throw new NotFoundException(`Workplace competency sign-off "${id}" not found`);
    }
    return signOff;
  }

  async findByPlacement(tenantId: string, placementId: string): Promise<WorkplaceCompetencySignOff[]> {
    return this.repo.find({
      where: { tenantId, placementId },
      order: { signedOffAt: 'DESC' },
    });
  }

  async findByStudent(tenantId: string, studentProfileId: string): Promise<WorkplaceCompetencySignOff[]> {
    return this.repo.find({
      where: { tenantId, studentProfileId },
      order: { signedOffAt: 'DESC' },
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const signOff = await this.findOne(tenantId, id);
    await this.repo.remove(signOff);
  }
}
