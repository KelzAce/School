import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsInt,
  IsArray,
  ValidateNested,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, CourseStatus } from '../entities/course.entity.js';

export class CourseModuleDto {
  @ApiProperty({ example: 'mod-001' })
  @IsString()
  @MaxLength(50)
  id: string;

  @ApiProperty({ example: 'Variables & Data Types' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Learn about variables and primitive data types.' })
  @IsString()
  content: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order: number;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'CS-101' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Introduction to Python' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'A beginner course covering Python fundamentals.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Program this course belongs to' })
  @IsOptional()
  @IsUUID()
  programId?: string;

  @ApiPropertyOptional({ enum: ['STEM', 'Arts', 'Entrepreneurship', 'Trades', 'General'], default: 'General' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  learningTrack?: string;

  @ApiPropertyOptional({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  difficulty?: Difficulty;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isAsynchronous?: boolean;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  credits?: number;

  @ApiPropertyOptional({ type: [CourseModuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseModuleDto)
  modules?: CourseModuleDto[];

  @ApiPropertyOptional({ enum: CourseStatus, default: CourseStatus.DRAFT })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
