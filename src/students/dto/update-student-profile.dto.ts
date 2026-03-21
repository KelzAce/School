import { PartialType, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateStudentProfileDto } from './create-student-profile.dto.js';
import { StudentStatus } from '../entities/student-profile.entity.js';

export class UpdateStudentProfileDto extends PartialType(
  OmitType(CreateStudentProfileDto, ['userId'] as const),
) {
  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
