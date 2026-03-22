import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BadgeEvidenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;
}

export class IssueBadgeDto {
  @ApiProperty()
  @IsUUID()
  studentProfileId: string;

  @ApiProperty()
  @IsUUID()
  badgeTemplateId: string;

  @ApiPropertyOptional({ type: [BadgeEvidenceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BadgeEvidenceDto)
  evidence?: BadgeEvidenceDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  issuedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export class RevokeBadgeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
