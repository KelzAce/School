import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

export class AnalyzeCustomSkillGapDto {
  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetName?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID('4', { each: true })
  requiredSkillIds: string[];

  @ApiPropertyOptional({ enum: ProficiencyLevel, default: ProficiencyLevel.BEGINNER })
  @IsOptional()
  @IsEnum(ProficiencyLevel)
  requiredLevel?: ProficiencyLevel;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeCourseRecommendations?: boolean;
}
