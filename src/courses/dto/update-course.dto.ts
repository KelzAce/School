import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto.js';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
