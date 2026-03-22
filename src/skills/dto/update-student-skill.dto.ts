import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStudentSkillDto {
  @ApiPropertyOptional({
    enum: ['novice', 'beginner', 'intermediate', 'advanced', 'expert'],
  })
  @IsOptional()
  @IsIn(['novice', 'beginner', 'intermediate', 'advanced', 'expert'])
  currentLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
