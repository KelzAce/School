import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeTemplate } from './entities/badge-template.entity.js';
import { IssuedBadge } from './entities/issued-badge.entity.js';
import { MicroCredential } from './entities/micro-credential.entity.js';
import { BadgesService } from './badges.service.js';
import { MicroCredentialsService } from './micro-credentials.service.js';
import { BadgesController } from './badges.controller.js';
import { MicroCredentialsController } from './micro-credentials.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([BadgeTemplate, IssuedBadge, MicroCredential]),
  ],
  controllers: [BadgesController, MicroCredentialsController],
  providers: [BadgesService, MicroCredentialsService],
  exports: [BadgesService, MicroCredentialsService],
})
export class BadgesModule {}
