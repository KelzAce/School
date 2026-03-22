import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cohort } from './entities/cohort.entity.js';
import { CreateCohortDto, UpdateCohortDto } from './dto/cohort.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class CohortsService {
  constructor(
    @InjectRepository(Cohort)
    private readonly cohortRepo: Repository<Cohort>,
  ) {}

  async create(tenantId: string, dto: CreateCohortDto): Promise<Cohort> {
    const exists = await this.cohortRepo.findOne({
      where: { tenantId, code: dto.code },
    });
    if (exists) {
      throw new ConflictException(
        `Cohort with code "${dto.code}" already exists`,
      );
    }

    const cohort = this.cohortRepo.create({
      tenantId,
      ...dto,
    } as Partial<Cohort>);
    return this.cohortRepo.save(cohort);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Cohort>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.cohortRepo.findAndCount({
      where: { tenantId },
      relations: ['program'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Cohort> {
    const cohort = await this.cohortRepo.findOne({
      where: { id, tenantId },
      relations: ['program'],
    });
    if (!cohort) {
      throw new NotFoundException(`Cohort "${id}" not found`);
    }
    return cohort;
  }

  async findByProgram(
    tenantId: string,
    programId: string,
  ): Promise<Cohort[]> {
    return this.cohortRepo.find({
      where: { tenantId, programId },
      order: { startDate: 'DESC' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateCohortDto,
  ): Promise<Cohort> {
    const cohort = await this.findOne(tenantId, id);
    Object.assign(cohort, dto);
    return this.cohortRepo.save(cohort);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const cohort = await this.findOne(tenantId, id);
    await this.cohortRepo.remove(cohort);
  }
}
