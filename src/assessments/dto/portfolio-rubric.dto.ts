import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRubricCriterionDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Maximum score for this criterion', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  maxScore: number;

  @ApiPropertyOptional({ description: 'Weight for weighted average', minimum: 0.01, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  weight?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreatePortfolioRubricDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Course UUID (optional)' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiProperty({ type: [CreateRubricCriterionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRubricCriterionDto)
  criteria: CreateRubricCriterionDto[];
}

export class UpdatePortfolioRubricDto {
  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
