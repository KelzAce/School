import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { CohortStatus } from '../entities/cohort.entity.js';

export class CreateCohortDto {
  @IsUUID()
  programId: string;

  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;
}

export class UpdateCohortDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;

  @IsOptional()
  @IsEnum(CohortStatus)
  status?: CohortStatus;
}
