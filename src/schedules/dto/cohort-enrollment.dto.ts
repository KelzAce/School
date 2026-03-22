import { IsUUID, IsOptional, IsEnum } from 'class-validator';
import { CohortEnrollmentStatus } from '../entities/cohort-enrollment.entity.js';

export class CreateCohortEnrollmentDto {
  @IsUUID()
  cohortId: string;

  @IsUUID()
  studentProfileId: string;
}

export class UpdateCohortEnrollmentDto {
  @IsEnum(CohortEnrollmentStatus)
  status: CohortEnrollmentStatus;
}
