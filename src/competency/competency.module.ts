import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetencyAssessment } from './entities/competency-assessment.entity.js';
import { MasteryRecord } from './entities/mastery-record.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { CompetencyAssessmentsService } from './competency-assessments.service.js';
import { ProgressService } from './progress.service.js';
import { CompetencyAssessmentsController } from './competency-assessments.controller.js';
import { ProgressController } from './progress.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetencyAssessment,
      MasteryRecord,
      StudentSkill,
      CourseSkill,
    ]),
  ],
  controllers: [CompetencyAssessmentsController, ProgressController],
  providers: [CompetencyAssessmentsService, ProgressService],
  exports: [CompetencyAssessmentsService, ProgressService],
})
export class CompetencyModule {}
