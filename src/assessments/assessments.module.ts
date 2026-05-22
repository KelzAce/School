import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity.js';
import { PortfolioItem } from './entities/portfolio-item.entity.js';
import { PortfolioRubric } from './entities/portfolio-rubric.entity.js';
import { PortfolioRubricCriterion } from './entities/portfolio-rubric-criterion.entity.js';
import { PortfolioAssessment } from './entities/portfolio-assessment.entity.js';
import { PortfolioCriterionScore } from './entities/portfolio-criterion-score.entity.js';
import { AssessmentsController } from './assessments.controller.js';
import { AssessmentsService } from './assessments.service.js';
import { PortfolioController } from './portfolio.controller.js';
import { PortfolioService } from './portfolio.service.js';
import { PortfolioItemsController } from './portfolio-items.controller.js';
import { PortfolioItemsService } from './portfolio-items.service.js';
import { PortfolioRubricsController } from './portfolio-rubrics.controller.js';
import { PortfolioRubricsService } from './portfolio-rubrics.service.js';
import { PortfolioAssessmentsController } from './portfolio-assessments.controller.js';
import { PortfolioAssessmentsService } from './portfolio-assessments.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Portfolio,
      PortfolioItem,
      PortfolioRubric,
      PortfolioRubricCriterion,
      PortfolioAssessment,
      PortfolioCriterionScore,
    ]),
  ],
  controllers: [
    AssessmentsController,
    PortfolioController,
    PortfolioItemsController,
    PortfolioRubricsController,
    PortfolioAssessmentsController,
  ],
  providers: [
    AssessmentsService,
    PortfolioService,
    PortfolioItemsService,
    PortfolioRubricsService,
    PortfolioAssessmentsService,
  ],
  exports: [
    AssessmentsService,
    PortfolioService,
    PortfolioItemsService,
    PortfolioRubricsService,
    PortfolioAssessmentsService,
  ],
})
export class AssessmentsModule {}
