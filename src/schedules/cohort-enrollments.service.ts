import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CohortEnrollment,
  CohortEnrollmentStatus,
} from './entities/cohort-enrollment.entity.js';
import { Cohort, CohortStatus } from './entities/cohort.entity.js';
import {
  CreateCohortEnrollmentDto,
  UpdateCohortEnrollmentDto,
} from './dto/cohort-enrollment.dto.js';

@Injectable()
export class CohortEnrollmentsService {
  constructor(
    @InjectRepository(CohortEnrollment)
    private readonly enrollmentRepo: Repository<CohortEnrollment>,
    @InjectRepository(Cohort)
    private readonly cohortRepo: Repository<Cohort>,
  ) {}

  async enroll(
    tenantId: string,
    dto: CreateCohortEnrollmentDto,
  ): Promise<CohortEnrollment> {
    const cohort = await this.cohortRepo.findOne({
      where: { id: dto.cohortId, tenantId },
    });
    if (!cohort) {
      throw new NotFoundException(`Cohort "${dto.cohortId}" not found`);
    }
    if (cohort.status !== CohortStatus.FORMING && cohort.status !== CohortStatus.ACTIVE) {
      throw new BadRequestException(
        'Cannot enroll into a cohort that is not forming or active',
      );
    }

    const currentCount = await this.enrollmentRepo.count({
      where: {
        cohortId: dto.cohortId,
        tenantId,
        status: CohortEnrollmentStatus.ACTIVE,
      },
    });
    if (currentCount >= cohort.maxCapacity) {
      throw new BadRequestException('Cohort has reached maximum capacity');
    }

    const exists = await this.enrollmentRepo.findOne({
      where: {
        tenantId,
        cohortId: dto.cohortId,
        studentProfileId: dto.studentProfileId,
      },
    });
    if (exists) {
      throw new ConflictException(
        'Student is already enrolled in this cohort',
      );
    }

    const enrollment = this.enrollmentRepo.create({
      tenantId,
      ...dto,
    } as Partial<CohortEnrollment>);
    return this.enrollmentRepo.save(enrollment);
  }

  async findByCohort(
    tenantId: string,
    cohortId: string,
  ): Promise<CohortEnrollment[]> {
    return this.enrollmentRepo.find({
      where: { tenantId, cohortId },
      relations: ['studentProfile'],
      order: { enrolledAt: 'ASC' },
    });
  }

  async findByStudent(
    tenantId: string,
    studentProfileId: string,
  ): Promise<CohortEnrollment[]> {
    return this.enrollmentRepo.find({
      where: { tenantId, studentProfileId },
      relations: ['cohort'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    dto: UpdateCohortEnrollmentDto,
  ): Promise<CohortEnrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException(`Cohort enrollment "${id}" not found`);
    }

    enrollment.status = dto.status;
    if (dto.status === CohortEnrollmentStatus.COMPLETED) {
      enrollment.completedAt = new Date();
    }
    return this.enrollmentRepo.save(enrollment);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id, tenantId },
    });
    if (!enrollment) {
      throw new NotFoundException(`Cohort enrollment "${id}" not found`);
    }
    await this.enrollmentRepo.remove(enrollment);
  }
}
