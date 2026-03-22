import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorsController } from './instructors.controller.js';
import { InstructorsService } from './instructors.service.js';
import { CourseAssignmentsController } from './course-assignments.controller.js';
import { CourseAssignmentsService } from './course-assignments.service.js';
import { InstructorProfile } from './entities/instructor-profile.entity.js';
import { CourseAssignment } from './entities/course-assignment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([InstructorProfile, CourseAssignment])],
  controllers: [InstructorsController, CourseAssignmentsController],
  providers: [InstructorsService, CourseAssignmentsService],
  exports: [InstructorsService, CourseAssignmentsService],
})
export class InstructorsModule {}
