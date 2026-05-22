import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PortfolioItemType } from '../entities/portfolio-item.entity.js';

export class CreatePortfolioItemDto {
  @ApiProperty()
  @IsUUID()
  portfolioId: string;

  @ApiProperty({ enum: PortfolioItemType })
  @IsEnum(PortfolioItemType)
  type: PortfolioItemType;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL to uploaded file' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'External URL reference' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  externalUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (file size, mime type, etc.)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdatePortfolioItemDto {
  @ApiPropertyOptional({ enum: PortfolioItemType })
  @IsOptional()
  @IsEnum(PortfolioItemType)
  type?: PortfolioItemType;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  externalUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
