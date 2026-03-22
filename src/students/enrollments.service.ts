import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity.js';
import { StudentProfile, StudentStatus } from './entities/student-profile.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(StudentProfile)
    private readonly studentRepo: Repository<StudentProfile>,
  ) {}

  async create(
    tenantId: string,
    dto: CreateEnrollmentDto,
  ): Promise<Enrollment> {
    const student = await this.studentRepo.findOne({
      where: { id: dto.studentProfileId, tenantId },
    });
    if (!student) {
      throw new NotFoundException(
        `Student profile "${dto.studentProfileId}" not found in this tenant`,
      );
    }

    const enrollment = this.enrollmentRepo.create({
      ...dto,
      tenantId,
    });
    return this.enrollmentRepo.save(enrollment);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Enrollment>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.enrollmentRepo.findAndCount({
      where: { tenantId },
      relations: ['studentProfile'],
      order: { appliedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByStudent(
    tenantId: string,
    studentProfileId: string,
  ): Promise<Enrollment[]> {
    return this.enrollmentRepo.find({
      where: { tenantId, studentProfileId },
      order: { appliedAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id, tenantId },
      relations: ['studentProfile'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with id "${id}" not found`);
    }
    return enrollment;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateEnrollmentStatusDto,
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(tenantId, id);

    this.validateStatusTransition(enrollment.status, dto.status);

    enrollment.status = dto.status;

    if (dto.status === EnrollmentStatus.ACTIVE) {
      enrollment.enrolledAt = new Date();
      // Also mark student profile as enrolled
      await this.studentRepo.update(enrollment.studentProfileId, {
        status: StudentStatus.ENROLLED,
        enrollmentDate: new Date(),
      });
    } else if (dto.status === EnrollmentStatus.COMPLETED) {
      enrollment.completedAt = new Date();
    }

    return this.enrollmentRepo.save(enrollment);
  }

  private validateStatusTransition(
    current: EnrollmentStatus,
    next: EnrollmentStatus,
  ): void {
    const allowed: Record<EnrollmentStatus, EnrollmentStatus[]> = {
      [EnrollmentStatus.PENDING]: [
        EnrollmentStatus.APPROVED,
        EnrollmentStatus.REJECTED,
        EnrollmentStatus.WITHDRAWN,
      ],
      [EnrollmentStatus.APPROVED]: [
        EnrollmentStatus.ACTIVE,
        EnrollmentStatus.WITHDRAWN,
      ],
      [EnrollmentStatus.REJECTED]: [],
      [EnrollmentStatus.ACTIVE]: [
        EnrollmentStatus.COMPLETED,
        EnrollmentStatus.WITHDRAWN,
      ],
      [EnrollmentStatus.COMPLETED]: [],
      [EnrollmentStatus.WITHDRAWN]: [],
    };

    if (!allowed[current].includes(next)) {
      throw new BadRequestException(
        `Cannot transition enrollment from "${current}" to "${next}"`,
      );
    }
  }
}
