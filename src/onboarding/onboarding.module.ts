import { Module } from '@nestjs/common';
import { SchoolsController } from './schools/schools.controller';
import { SchoolsService } from './schools/schools.service';
import { IndividualsController } from './individuals/individuals.controller';
import { IndividualsService } from './individuals/individuals.service';
import { OrganizationsController } from './organizations/organizations.controller';
import { OrganizationsService } from './organizations/organizations.service';

@Module({
  controllers: [SchoolsController, IndividualsController, OrganizationsController],
  providers: [SchoolsService, IndividualsService, OrganizationsService],
  exports: [SchoolsService, IndividualsService, OrganizationsService],
})
export class OnboardingModule {}
