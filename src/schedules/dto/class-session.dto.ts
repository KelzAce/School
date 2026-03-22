import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  MaxLength,
  IsDateString,
  IsMilitaryTime,
} from 'class-validator';
import {
  SessionType,
  SessionStatus,
  DayOfWeek,
} from '../entities/class-session.entity.js';

export class CreateClassSessionDto {
  @IsUUID()
  cohortId: string;

  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsUUID()
  instructorProfileId?: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  room?: string;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsMilitaryTime()
  startTime: string;

  @IsMilitaryTime()
  endTime: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class UpdateClassSessionDto {
  @IsOptional()
  @IsUUID()
  instructorProfileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  room?: string;

  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @IsOptional()
  @IsMilitaryTime()
  startTime?: string;

  @IsOptional()
  @IsMilitaryTime()
  endTime?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}
