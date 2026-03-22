import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgramStatus } from '../entities/program.entity.js';

export class CreateProgramDto {
  @ApiProperty({ example: 'DIP-SE-2026' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Diploma in Software Engineering' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'A 2-year vocational diploma covering full-stack development and DevOps.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['STEM', 'Arts', 'Entrepreneurship', 'Trades', 'General'], default: 'General' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  learningTrack?: string;

  @ApiPropertyOptional({ example: 48 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationWeeks?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalCredits?: number;

  @ApiPropertyOptional({ enum: ProgramStatus, default: ProgramStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;
}
