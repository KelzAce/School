import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { AssessmentType } from '../entities/competency-assessment.entity.js';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

export class CreateCompetencyAssessmentDto {
  @IsUUID()
  studentProfileId: string;

  @IsUUID()
  skillId: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsEnum(AssessmentType)
  assessmentType: AssessmentType;

  @IsNumber()
  @Min(0)
  score: number;

  @IsNumber()
  @Min(0.01)
  maxScore: number;

  @IsEnum(ProficiencyLevel)
  demonstratedLevel: ProficiencyLevel;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  evidence?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  assessedBy?: string;
}
