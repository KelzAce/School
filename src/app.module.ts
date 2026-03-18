import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PainPointsModule } from './pain-points/pain-points.module';

@Module({
  imports: [PainPointsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
