import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OutcomesQueryDto {
  @ApiPropertyOptional({ description: 'Filter results from this date (ISO 8601)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter results to this date (ISO 8601)', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
