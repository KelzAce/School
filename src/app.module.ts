import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TenantsModule } from './tenants/tenants.module.js';
import { PainPointsModule } from './pain-points/pain-points.module.js';
import { StudentsModule } from './students/students.module.js';
import { CoursesModule } from './courses/courses.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { AssessmentsModule } from './assessments/assessments.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { OnboardingModule } from './onboarding/onboarding.module.js';
import databaseConfig from './config/database.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<boolean>('database.logging'),
        autoLoadEntities: true,
      }),
    }),
    TenantsModule,
    PainPointsModule,
    StudentsModule,
    CoursesModule,
    SchedulesModule,
    AssessmentsModule,
    MessagesModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
