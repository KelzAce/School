import { IsUUID, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseAssignmentDto {
  @ApiProperty({ description: 'Instructor profile ID' })
  @IsUUID()
  instructorProfileId: string;

  @ApiProperty({ description: 'Course ID to assign' })
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({
    enum: ['primary', 'assistant', 'guest'],
    default: 'primary',
  })
  @IsOptional()
  @IsIn(['primary', 'assistant', 'guest'])
  role?: string;
}
