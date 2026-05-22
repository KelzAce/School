import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { HiringIntent } from '../entities/portfolio-review.entity.js';

export class CreatePortfolioReviewDto {
  @ApiProperty()
  @IsUUID()
  partnerId: string;

  @ApiProperty()
  @IsUUID()
  portfolioId: string;

  @ApiProperty()
  @IsUUID()
  studentProfileId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areasForImprovement?: string[];

  @ApiProperty({ enum: HiringIntent })
  @IsEnum(HiringIntent)
  @IsNotEmpty()
  hiringIntent: HiringIntent;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewedBy?: string;
}

export class UpdatePortfolioReviewDto extends PartialType(CreatePortfolioReviewDto) {}
