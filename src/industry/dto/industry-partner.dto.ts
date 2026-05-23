import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { PartnerSize } from '../entities/industry-partner.entity.js';

export class CreateIndustryPartnerDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  industry: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ enum: PartnerSize })
  @IsEnum(PartnerSize)
  size: PartnerSize;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  socialLinks?: { linkedin?: string; twitter?: string; github?: string };
}

export class UpdateIndustryPartnerDto extends PartialType(CreateIndustryPartnerDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
