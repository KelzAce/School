import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PortfolioStatus } from '../entities/portfolio.entity.js';

export class CreatePortfolioDto {
  @ApiProperty({ description: 'Student profile UUID' })
  @IsUUID()
  studentProfileId: string;

  @ApiPropertyOptional({ description: 'Course UUID (optional)' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdatePortfolioDto {
  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: PortfolioStatus })
  @IsOptional()
  @IsEnum(PortfolioStatus)
  status?: PortfolioStatus;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SubmitPortfolioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
