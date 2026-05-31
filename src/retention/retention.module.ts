import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { Enrollment } from '../students/entities/enrollment.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { CompetencyAssessment } from '../competency/entities/competency-assessment.entity.js';
import { Portfolio } from '../assessments/entities/portfolio.entity.js';
import { PortfolioAssessment } from '../assessments/entities/portfolio-assessment.entity.js';
import { WorkplacePlacement } from '../workplace/entities/workplace-placement.entity.js';
import { WorkplaceLog } from '../workplace/entities/workplace-log.entity.js';
import { RetentionService } from './retention.service.js';
import { RetentionController } from './retention.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentProfile,
      Enrollment,
      MasteryRecord,
      CompetencyAssessment,
      Portfolio,
      PortfolioAssessment,
      WorkplacePlacement,
      WorkplaceLog,
    ]),
  ],
  controllers: [RetentionController],
  providers: [RetentionService],
  exports: [RetentionService],
})
export class RetentionModule {}
