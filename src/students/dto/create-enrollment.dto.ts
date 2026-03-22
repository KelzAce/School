import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'Student profile ID' })
  @IsUUID()
  studentProfileId: string;

  @ApiProperty({ description: 'Program / course ID to enroll in' })
  @IsUUID()
  programId: string;
}
