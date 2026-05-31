import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum RiskLevel {
  NONE     = 'none',
  LOW      = 'low',
  MEDIUM   = 'medium',
  HIGH     = 'high',
  CRITICAL = 'critical',
}

export class RetentionQueryDto {
  @ApiPropertyOptional({ enum: RiskLevel, description: 'Filter by minimum risk level' })
  @IsOptional()
  @IsEnum(RiskLevel)
  minRiskLevel?: RiskLevel;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
