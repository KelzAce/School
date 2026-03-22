import { PartialType } from '@nestjs/swagger';
import { CreateInstructorProfileDto } from './create-instructor-profile.dto.js';

export class UpdateInstructorProfileDto extends PartialType(
  CreateInstructorProfileDto,
) {}
