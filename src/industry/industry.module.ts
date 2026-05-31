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
import { SkillGapService } from './skill-gap.service.js';
import { IndustryPartnersController } from './industry-partners.controller.js';
import { OpportunitiesController } from './opportunities.controller.js';
import { OpportunityApplicationsController } from './opportunity-applications.controller.js';
import { PortfolioReviewsController } from './portfolio-reviews.controller.js';
import { CredentialValidationsController } from './credential-validations.controller.js';
import { SkillGapController } from './skill-gap.controller.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IndustryPartner,
      Opportunity,
      OpportunityApplication,
      PortfolioReview,
      CredentialValidation,
      StudentProfile,
      StudentSkill,
      MasteryRecord,
      Skill,
      CourseSkill,
    ]),
  ],
  controllers: [
    IndustryPartnersController,
    OpportunitiesController,
    OpportunityApplicationsController,
    PortfolioReviewsController,
    CredentialValidationsController,
    SkillGapController,
  ],
  providers: [
    IndustryPartnersService,
    OpportunitiesService,
    OpportunityApplicationsService,
    PortfolioReviewsService,
    CredentialValidationsService,
    SkillGapService,
  ],
  exports: [
    IndustryPartnersService,
    OpportunitiesService,
    OpportunityApplicationsService,
    PortfolioReviewsService,
    CredentialValidationsService,
    SkillGapService,
  ],
})
export class IndustryModule {}
