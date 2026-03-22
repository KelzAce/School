import { IsUUID, IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentSkillDto {
  @ApiProperty({ description: 'Student profile ID' })
  @IsUUID()
  studentProfileId: string;

  @ApiProperty({ description: 'Skill ID' })
  @IsUUID()
  skillId: string;

  @ApiPropertyOptional({
    enum: ['novice', 'beginner', 'intermediate', 'advanced', 'expert'],
    default: 'novice',
  })
  @IsOptional()
  @IsIn(['novice', 'beginner', 'intermediate', 'advanced', 'expert'])
  currentLevel?: string;

  @ApiPropertyOptional({ description: 'How the proficiency was verified' })
  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
