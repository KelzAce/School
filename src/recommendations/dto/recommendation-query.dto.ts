import { IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RecommendationQueryDto {
  @ApiPropertyOptional({ description: 'Max results to return', default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter recommendations by target pathway UUID' })
  @IsOptional()
  @IsUUID()
  pathwayId?: string;
}
