import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkplacePlacement } from './entities/workplace-placement.entity.js';
import { WorkplaceLog } from './entities/workplace-log.entity.js';
import { SupervisorAssessment } from './entities/supervisor-assessment.entity.js';
import { WorkplaceCompetencySignOff } from './entities/workplace-competency-signoff.entity.js';
import { WorkplacePlacementsService } from './workplace-placements.service.js';
import { WorkplaceLogsService } from './workplace-logs.service.js';
import { SupervisorAssessmentsService } from './supervisor-assessments.service.js';
import { WorkplaceCompetencySignOffsService } from './workplace-competency-signoffs.service.js';
import { WorkplaceSummaryService } from './workplace-summary.service.js';
import { WorkplacePlacementsController } from './workplace-placements.controller.js';
import { WorkplaceLogsController } from './workplace-logs.controller.js';
import { SupervisorAssessmentsController } from './supervisor-assessments.controller.js';
import { WorkplaceCompetencySignOffsController } from './workplace-competency-signoffs.controller.js';
import { WorkplaceSummaryController } from './workplace-summary.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkplacePlacement,
      WorkplaceLog,
      SupervisorAssessment,
      WorkplaceCompetencySignOff,
    ]),
  ],
  controllers: [
    WorkplacePlacementsController,
    WorkplaceLogsController,
    SupervisorAssessmentsController,
    WorkplaceCompetencySignOffsController,
    WorkplaceSummaryController,
  ],
  providers: [
    WorkplacePlacementsService,
    WorkplaceLogsService,
    SupervisorAssessmentsService,
    WorkplaceCompetencySignOffsService,
    WorkplaceSummaryService,
  ],
  exports: [
    WorkplacePlacementsService,
    WorkplaceLogsService,
    SupervisorAssessmentsService,
    WorkplaceCompetencySignOffsService,
    WorkplaceSummaryService,
  ],
})
export class WorkplaceModule {}
