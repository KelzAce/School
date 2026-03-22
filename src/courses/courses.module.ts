import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { ProgramsController } from './programs.controller.js';
import { ProgramsService } from './programs.service.js';
import { Course } from './entities/course.entity.js';
import { Program } from './entities/program.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Program])],
  controllers: [CoursesController, ProgramsController],
  providers: [CoursesService, ProgramsService],
  exports: [CoursesService, ProgramsService],
})
export class CoursesModule {}
