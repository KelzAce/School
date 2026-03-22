import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './entities/student-profile.entity.js';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly studentRepo: Repository<StudentProfile>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateStudentProfileDto,
  ): Promise<StudentProfile> {
    const existing = await this.studentRepo.findOne({
      where: { tenantId, studentNumber: dto.studentNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Student number "${dto.studentNumber}" already exists in this tenant`,
      );
    }

    const profile = this.studentRepo.create({ ...dto, tenantId });
    return this.studentRepo.save(profile);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<StudentProfile>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.studentRepo.findAndCount({
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

  async findOne(tenantId: string, id: string): Promise<StudentProfile> {
    const profile = await this.studentRepo.findOne({
      where: { id, tenantId },
      relations: ['user', 'enrollments'],
    });
    if (!profile) {
      throw new NotFoundException(
        `Student profile with id "${id}" not found`,
      );
    }
    return profile;
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateStudentProfileDto,
  ): Promise<StudentProfile> {
    const profile = await this.findOne(tenantId, id);

    if (dto.studentNumber && dto.studentNumber !== profile.studentNumber) {
      const taken = await this.studentRepo.findOne({
        where: { tenantId, studentNumber: dto.studentNumber },
      });
      if (taken) {
        throw new ConflictException(
          `Student number "${dto.studentNumber}" already exists in this tenant`,
        );
      }
    }

    Object.assign(profile, dto);
    return this.studentRepo.save(profile);
  }
}
