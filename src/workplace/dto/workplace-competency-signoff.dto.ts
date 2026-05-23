import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

export class CreateWorkplaceCompetencySignOffDto {
  @ApiProperty()
  @IsUUID()
  placementId: string;

  @ApiProperty()
  @IsUUID()
  studentProfileId: string;

  @ApiProperty()
  @IsUUID()
  skillId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  skillName: string;

  @ApiProperty({ enum: ProficiencyLevel })
  @IsEnum(ProficiencyLevel)
  demonstratedLevel: ProficiencyLevel;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  signedOffBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidence?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
