import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseAssignmentStatusDto {
  @ApiProperty({ enum: ['active', 'completed', 'withdrawn'] })
  @IsIn(['active', 'completed', 'withdrawn'])
  status: string;
}
