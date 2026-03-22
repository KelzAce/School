import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async create(tenantId: string, dto: CreateCourseDto): Promise<Course> {
    const existing = await this.courseRepo.findOne({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Course code "${dto.code}" already exists in this tenant`,
      );
    }

    const course = this.courseRepo.create({ ...dto, tenantId });
    return this.courseRepo.save(course);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
    track?: string,
  ): Promise<PaginatedResult<Course>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (track) {
      where.learningTrack = track;
    }

    const [data, total] = await this.courseRepo.findAndCount({
      where,
      relations: ['program'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id, tenantId },
      relations: ['program'],
    });
    if (!course) {
      throw new NotFoundException(`Course with id "${id}" not found`);
    }
    return course;
  }

  async findByProgram(tenantId: string, programId: string): Promise<Course[]> {
    return this.courseRepo.find({
      where: { tenantId, programId },
      order: { createdAt: 'ASC' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.findOne(tenantId, id);

    if (dto.code && dto.code !== course.code) {
      const taken = await this.courseRepo.findOne({
        where: { tenantId, code: dto.code },
      });
      if (taken) {
        throw new ConflictException(
          `Course code "${dto.code}" already exists in this tenant`,
        );
      }
    }

    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  async remove(tenantId: string, id: string): Promise<Course> {
    const course = await this.findOne(tenantId, id);
    return this.courseRepo.remove(course);
  }
}
