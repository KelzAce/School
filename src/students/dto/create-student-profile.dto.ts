import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LearningTrack } from '../entities/student-profile.entity.js';

export class CreateStudentProfileDto {
  @ApiProperty({ description: 'User account ID for this student' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'STU-2025-001' })
  @IsString()
  @MaxLength(50)
  studentNumber: string;

  @ApiPropertyOptional({ example: '2008-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '123 Main St, Cape Town' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: { name: 'Jane Doe', phone: '+27123456789', relationship: 'Mother' } })
  @IsOptional()
  @IsObject()
  emergencyContact?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'Robotics engineering and AI safety' })
  @IsOptional()
  @IsString()
  careerAspirations?: string;

  @ApiPropertyOptional({ example: ['Python', 'Electronics', 'Mathematics'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  priorCompetencies?: string[];

  @ApiPropertyOptional({ enum: ['STEM', 'Arts', 'Entrepreneurship', 'Trades', 'General'], default: 'General' })
  @IsOptional()
  @IsEnum(['STEM', 'Arts', 'Entrepreneurship', 'Trades', 'General'] as any)
  learningTrack?: LearningTrack;
}
