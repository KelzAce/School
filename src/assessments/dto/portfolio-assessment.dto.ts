import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioAssessmentDto {
  @ApiProperty()
  @IsUUID()
  portfolioId: string;

  @ApiProperty()
  @IsUUID()
  rubricId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  assessedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  overallFeedback?: string;
}

export class AddCriterionScoreDto {
  @ApiProperty()
  @IsUUID()
  criterionId: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class CompleteAssessmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  overallFeedback?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  assessedBy?: string;
}
