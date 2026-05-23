import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsEmail,
  IsDateString,
  IsInt,
  IsBoolean,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PlacementType, PlacementStatus } from '../entities/workplace-placement.entity.js';

export class CreateWorkplacePlacementDto {
  @ApiProperty()
  @IsUUID()
  studentProfileId: string;

  @ApiProperty()
  @IsUUID()
  partnerId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  partnerName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supervisorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  supervisorEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PlacementType })
  @IsEnum(PlacementType)
  type: PlacementType;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  totalHoursRequired?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWorkplacePlacementDto extends PartialType(CreateWorkplacePlacementDto) {
  @ApiPropertyOptional({ enum: PlacementStatus })
  @IsOptional()
  @IsEnum(PlacementStatus)
  status?: PlacementStatus;
}
