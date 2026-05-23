import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CredentialType, ValidationStatus } from '../entities/credential-validation.entity.js';

export class CreateCredentialValidationDto {
  @ApiProperty()
  @IsUUID()
  partnerId: string;

  @ApiProperty({ enum: CredentialType })
  @IsEnum(CredentialType)
  credentialType: CredentialType;

  @ApiProperty()
  @IsUUID()
  credentialId: string;

  @ApiProperty()
  @IsUUID()
  studentProfileId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateValidationStatusDto {
  @ApiProperty({ enum: ValidationStatus })
  @IsEnum(ValidationStatus)
  @IsNotEmpty()
  status: ValidationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  validatedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
