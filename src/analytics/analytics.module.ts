import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../students/entities/enrollment.entity.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { Program } from '../courses/entities/program.entity.js';
import { Course } from '../courses/entities/course.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { Cohort } from '../schedules/entities/cohort.entity.js';
import { CohortEnrollment } from '../schedules/entities/cohort-enrollment.entity.js';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      StudentProfile,
      Program,
      Course,
      MasteryRecord,
      StudentSkill,
      Skill,
      Cohort,
      CohortEnrollment,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
