import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  IsInt,
  IsIn,
  Min,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CertificationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  issuer: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  dateObtained: string;

  @ApiPropertyOptional({ example: '2027-01-15' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class CreateInstructorProfileDto {
  @ApiProperty({ description: 'User ID to link this instructor profile to' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Unique employee number within the tenant' })
  @IsString()
  employeeNumber: string;

  @ApiPropertyOptional({ description: 'Professional title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Short biography' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Areas of specialization',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiPropertyOptional({
    description: 'Academic qualifications',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[];

  @ApiPropertyOptional({
    description: 'Professional certifications',
    type: [CertificationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications?: CertificationDto[];

  @ApiPropertyOptional({ description: 'Years of professional experience' })
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of courses the instructor can teach',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxCourseLoad?: number;

  @ApiPropertyOptional({ description: 'Hire date', example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({
    enum: ['active', 'on_leave', 'inactive'],
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'on_leave', 'inactive'])
  status?: string;
}
