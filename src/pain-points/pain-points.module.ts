import { Module } from '@nestjs/common';
import { PainPointsController } from './pain-points.controller';
import { PainPointsService } from './pain-points.service';

@Module({
  controllers: [PainPointsController],
  providers: [PainPointsService],
})
export class PainPointsModule {}
