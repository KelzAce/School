import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { Course } from '../courses/entities/course.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';
import { Enrollment } from '../students/entities/enrollment.entity.js';
import { CareerPathway } from '../career-pathways/entities/career-pathway.entity.js';
import { CareerPathwaySkill } from '../career-pathways/entities/career-pathway-skill.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { Program } from '../courses/entities/program.entity.js';
import { RecommendationsService } from './recommendations.service.js';
import { RecommendationsController } from './recommendations.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentProfile,
      StudentSkill,
      MasteryRecord,
      Course,
      CourseSkill,
      Enrollment,
      CareerPathway,
      CareerPathwaySkill,
      Skill,
      Program,
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
