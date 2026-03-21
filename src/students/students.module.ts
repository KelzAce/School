import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';
import { StudentProfile } from './entities/student-profile.entity.js';
import { Enrollment } from './entities/enrollment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile, Enrollment])],
  controllers: [StudentsController, EnrollmentsController],
  providers: [StudentsService, EnrollmentsService],
  exports: [StudentsService, EnrollmentsService],
})
export class StudentsModule {}
