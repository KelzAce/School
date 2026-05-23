import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsEmail,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SupervisorRating } from '../entities/supervisor-assessment.entity.js';

export class CreateSupervisorAssessmentDto {
  @ApiProperty()
  @IsUUID()
  placementId: string;

  @ApiProperty()
  @IsUUID()
  studentProfileId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  assessmentPeriod: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  assessedBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  assessedByEmail?: string;

  @ApiProperty({ enum: SupervisorRating })
  @IsEnum(SupervisorRating)
  overallRating: SupervisorRating;

  @ApiProperty({ enum: SupervisorRating })
  @IsEnum(SupervisorRating)
  technicalSkillsRating: SupervisorRating;

  @ApiProperty({ enum: SupervisorRating })
  @IsEnum(SupervisorRating)
  communicationRating: SupervisorRating;

  @ApiProperty({ enum: SupervisorRating })
  @IsEnum(SupervisorRating)
  teamworkRating: SupervisorRating;

  @ApiProperty({ enum: SupervisorRating })
  @IsEnum(SupervisorRating)
  initiativeRating: SupervisorRating;

  @ApiProperty({ enum: SupervisorRating })
  @IsEnum(SupervisorRating)
  reliabilityRating: SupervisorRating;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  areasForImprovement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecommendedForHire?: boolean;
}

export class UpdateSupervisorAssessmentDto extends PartialType(CreateSupervisorAssessmentDto) {}
