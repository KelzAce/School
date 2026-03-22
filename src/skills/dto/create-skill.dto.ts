import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ description: 'Skill category ID' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ description: 'Parent skill ID for hierarchical structure' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Unique code within the tenant', example: 'WLD-101' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'MIG Welding' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ['technical', 'soft', 'digital', 'industry'],
    default: 'technical',
  })
  @IsOptional()
  @IsIn(['technical', 'soft', 'digital', 'industry'])
  type?: string;

  @ApiPropertyOptional({ description: 'O*NET SOC code', example: '51-4121.00' })
  @IsOptional()
  @IsString()
  onetCode?: string;

  @ApiPropertyOptional({ description: 'ESCO code' })
  @IsOptional()
  @IsString()
  escoCode?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
