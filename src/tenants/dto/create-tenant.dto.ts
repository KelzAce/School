import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Cape Town Vocational Academy' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'cape-town-vocational', description: 'URL-safe identifier, lowercase letters, numbers, and hyphens only' })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase with hyphens only (e.g. "my-school")',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'capetown.school-reimagined.com' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ example: { academicYear: '2026', term: 'Q1' } })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'Africa/Johannesburg' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({ example: 'admin@capetown-vocational.ac.za' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+27 21 555 0100' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;
}
