import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity.js';
import { CreateProgramDto } from './dto/create-program.dto.js';
import { UpdateProgramDto } from './dto/update-program.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
  ) {}

  async create(tenantId: string, dto: CreateProgramDto): Promise<Program> {
    const existing = await this.programRepo.findOne({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Program code "${dto.code}" already exists in this tenant`,
      );
    }

    const program = this.programRepo.create({ ...dto, tenantId });
    return this.programRepo.save(program);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Program>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.programRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Program> {
    const program = await this.programRepo.findOne({
      where: { id, tenantId },
      relations: ['courses'],
    });
    if (!program) {
      throw new NotFoundException(`Program with id "${id}" not found`);
    }
    return program;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateProgramDto,
  ): Promise<Program> {
    const program = await this.findOne(tenantId, id);

    if (dto.code && dto.code !== program.code) {
      const taken = await this.programRepo.findOne({
        where: { tenantId, code: dto.code },
      });
      if (taken) {
        throw new ConflictException(
          `Program code "${dto.code}" already exists in this tenant`,
        );
      }
    }

    Object.assign(program, dto);
    return this.programRepo.save(program);
  }

  async remove(tenantId: string, id: string): Promise<Program> {
    const program = await this.findOne(tenantId, id);
    return this.programRepo.remove(program);
  }
}
