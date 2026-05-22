import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustryPartner } from './entities/industry-partner.entity.js';
import { Opportunity } from './entities/opportunity.entity.js';
import { OpportunityApplication } from './entities/opportunity-application.entity.js';
import { PortfolioReview } from './entities/portfolio-review.entity.js';
import { CredentialValidation } from './entities/credential-validation.entity.js';
import { IndustryPartnersService } from './industry-partners.service.js';
import { OpportunitiesService } from './opportunities.service.js';
import { OpportunityApplicationsService } from './opportunity-applications.service.js';
import { PortfolioReviewsService } from './portfolio-reviews.service.js';
import { CredentialValidationsService } from './credential-validations.service.js';
import { IndustryPartnersController } from './industry-partners.controller.js';
import { OpportunitiesController } from './opportunities.controller.js';
import { OpportunityApplicationsController } from './opportunity-applications.controller.js';
import { PortfolioReviewsController } from './portfolio-reviews.controller.js';
import { CredentialValidationsController } from './credential-validations.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IndustryPartner,
      Opportunity,
      OpportunityApplication,
      PortfolioReview,
      CredentialValidation,
    ]),
  ],
  controllers: [
    IndustryPartnersController,
    OpportunitiesController,
    OpportunityApplicationsController,
    PortfolioReviewsController,
    CredentialValidationsController,
  ],
  providers: [
    IndustryPartnersService,
    OpportunitiesService,
    OpportunityApplicationsService,
    PortfolioReviewsService,
    CredentialValidationsService,
  ],
  exports: [
    IndustryPartnersService,
    OpportunitiesService,
    OpportunityApplicationsService,
    PortfolioReviewsService,
    CredentialValidationsService,
  ],
})
export class IndustryModule {}
