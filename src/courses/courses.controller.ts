import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  CoursesService,
  Course,
  CreateCourseDto,
} from './courses.service';
import { LearningTrack } from '../students/entities/student-profile.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query('track') track?: LearningTrack): Course[] {
    if (track) {
      return this.coursesService.findByTrack(track);
    }
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Course {
    const course = this.coursesService.findOne(id);
    if (!course) {
      throw new NotFoundException(`Course with id "${id}" not found`);
    }
    return course;
  }

  @Post()
  create(@Body() dto: CreateCourseDto): Course {
    return this.coursesService.create(dto);
  }
}
