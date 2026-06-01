import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { Enrollment } from '../students/entities/enrollment.entity.js';
import { WorkplacePlacement } from '../workplace/entities/workplace-placement.entity.js';
import { OpportunityApplication } from '../industry/entities/opportunity-application.entity.js';
import { IssuedBadge } from '../badges/entities/issued-badge.entity.js';
import { MicroCredential } from '../badges/entities/micro-credential.entity.js';
import { OutcomesService } from './outcomes.service.js';
import { OutcomesController } from './outcomes.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentProfile,
      Enrollment,
      WorkplacePlacement,
      OpportunityApplication,
      IssuedBadge,
      MicroCredential,
    ]),
  ],
  controllers: [OutcomesController],
  providers: [OutcomesService],
  exports: [OutcomesService],
})
export class OutcomesModule {}
