import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from './entities/class-session.entity.js';
import {
  CreateClassSessionDto,
  UpdateClassSessionDto,
} from './dto/class-session.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class ClassSessionsService {
  constructor(
    @InjectRepository(ClassSession)
    private readonly sessionRepo: Repository<ClassSession>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateClassSessionDto,
  ): Promise<ClassSession> {
    const conflict = await this.sessionRepo.findOne({
      where: {
        tenantId,
        cohortId: dto.cohortId,
        courseId: dto.courseId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
      },
    });
    if (conflict) {
      throw new ConflictException(
        'A session already exists for this cohort/course at the same day and time',
      );
    }

    const session = this.sessionRepo.create({
      tenantId,
      ...dto,
    } as Partial<ClassSession>);
    return this.sessionRepo.save(session);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ClassSession>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.sessionRepo.findAndCount({
      where: { tenantId },
      relations: ['cohort', 'course', 'instructorProfile'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<ClassSession> {
    const session = await this.sessionRepo.findOne({
      where: { id, tenantId },
      relations: ['cohort', 'course', 'instructorProfile'],
    });
    if (!session) {
      throw new NotFoundException(`Class session "${id}" not found`);
    }
    return session;
  }

  async findByCohort(
    tenantId: string,
    cohortId: string,
  ): Promise<ClassSession[]> {
    return this.sessionRepo.find({
      where: { tenantId, cohortId },
      relations: ['course', 'instructorProfile'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findByInstructor(
    tenantId: string,
    instructorProfileId: string,
  ): Promise<ClassSession[]> {
    return this.sessionRepo.find({
      where: { tenantId, instructorProfileId },
      relations: ['cohort', 'course'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateClassSessionDto,
  ): Promise<ClassSession> {
    const session = await this.findOne(tenantId, id);
    Object.assign(session, dto);
    return this.sessionRepo.save(session);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const session = await this.findOne(tenantId, id);
    await this.sessionRepo.remove(session);
  }
}
