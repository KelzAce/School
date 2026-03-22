import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorProfile } from './entities/instructor-profile.entity.js';
import { CreateInstructorProfileDto } from './dto/create-instructor-profile.dto.js';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectRepository(InstructorProfile)
    private readonly instructorRepo: Repository<InstructorProfile>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateInstructorProfileDto,
  ): Promise<InstructorProfile> {
    const existing = await this.instructorRepo.findOne({
      where: { tenantId, employeeNumber: dto.employeeNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Employee number "${dto.employeeNumber}" already exists in this tenant`,
      );
    }

    const profile = this.instructorRepo.create({
      ...dto,
      tenantId,
    } as Partial<InstructorProfile>);
    return this.instructorRepo.save(profile);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<InstructorProfile>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.instructorRepo.findAndCount({
      where: { tenantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<InstructorProfile> {
    const profile = await this.instructorRepo.findOne({
      where: { id, tenantId },
      relations: ['user', 'courseAssignments', 'courseAssignments.course'],
    });
    if (!profile) {
      throw new NotFoundException(
        `Instructor profile with id "${id}" not found`,
      );
    }
    return profile;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateInstructorProfileDto,
  ): Promise<InstructorProfile> {
    const profile = await this.findOne(tenantId, id);

    if (dto.employeeNumber && dto.employeeNumber !== profile.employeeNumber) {
      const taken = await this.instructorRepo.findOne({
        where: { tenantId, employeeNumber: dto.employeeNumber },
      });
      if (taken) {
        throw new ConflictException(
          `Employee number "${dto.employeeNumber}" already exists in this tenant`,
        );
      }
    }

    Object.assign(profile, dto);
    return this.instructorRepo.save(profile);
  }
}
