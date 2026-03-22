import { IsUUID, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseSkillDto {
  @ApiProperty({ description: 'Course ID' })
  @IsUUID()
  courseId: string;

  @ApiProperty({ description: 'Skill ID' })
  @IsUUID()
  skillId: string;

  @ApiPropertyOptional({
    enum: ['novice', 'beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  })
  @IsOptional()
  @IsIn(['novice', 'beginner', 'intermediate', 'advanced', 'expert'])
  targetLevel?: string;

  @ApiPropertyOptional({ description: 'Whether this is a primary learning outcome' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
