import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LogStatus } from '../entities/workplace-log.entity.js';

export class CreateWorkplaceLogDto {
  @ApiProperty()
  @IsUUID()
  placementId: string;

  @ApiProperty()
  @IsUUID()
  studentProfileId: string;

  @ApiProperty()
  @IsDateString()
  logDate: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.25)
  @Max(24)
  hoursWorked: number;

  @ApiProperty()
  @IsString()
  activities: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  learningReflection?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  challengesFaced?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  skillsApplied?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  attachmentUrl?: string;
}

export class UpdateWorkplaceLogDto extends PartialType(CreateWorkplaceLogDto) {}

export class ReviewLogDto {
  @ApiProperty({ enum: LogStatus })
  @IsEnum(LogStatus)
  status: LogStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supervisorFeedback?: string;

  @ApiProperty()
  @IsString()
  reviewedBy: string;
}
