import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort } from './entities/cohort.entity.js';
import { ClassSession } from './entities/class-session.entity.js';
import { CohortEnrollment } from './entities/cohort-enrollment.entity.js';
import { CohortsController } from './schedules.controller.js';
import { ClassSessionsController } from './class-sessions.controller.js';
import { CohortEnrollmentsController } from './cohort-enrollments.controller.js';
import { CohortsService } from './cohorts.service.js';
import { ClassSessionsService } from './class-sessions.service.js';
import { CohortEnrollmentsService } from './cohort-enrollments.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cohort, ClassSession, CohortEnrollment]),
  ],
  controllers: [
    CohortsController,
    ClassSessionsController,
    CohortEnrollmentsController,
  ],
  providers: [CohortsService, ClassSessionsService, CohortEnrollmentsService],
  exports: [CohortsService, ClassSessionsService, CohortEnrollmentsService],
})
export class SchedulesModule {}
