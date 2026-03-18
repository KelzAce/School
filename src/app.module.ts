import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PainPointsModule } from './pain-points/pain-points.module';
import { StudentsModule } from './students/students.module';
import { CoursesModule } from './courses/courses.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    PainPointsModule,
    StudentsModule,
    CoursesModule,
    SchedulesModule,
    AssessmentsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
