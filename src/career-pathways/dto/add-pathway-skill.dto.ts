import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

export class AddPathwaySkillDto {
  @ApiProperty()
  @IsUUID('4')
  skillId: string;

  @ApiProperty({ enum: ProficiencyLevel })
  @IsEnum(ProficiencyLevel)
  requiredLevel: ProficiencyLevel;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
