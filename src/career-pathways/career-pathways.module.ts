import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerPathway } from './entities/career-pathway.entity.js';
import { CareerPathwaySkill } from './entities/career-pathway-skill.entity.js';
import { CareerPathwaysService } from './career-pathways.service.js';
import { CareerPathwaysController } from './career-pathways.controller.js';
import { Skill } from '../skills/entities/skill.entity.js';
import { StudentProfile } from '../students/entities/student-profile.entity.js';
import { StudentSkill } from '../skills/entities/student-skill.entity.js';
import { MasteryRecord } from '../competency/entities/mastery-record.entity.js';
import { CourseSkill } from '../skills/entities/course-skill.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CareerPathway,
      CareerPathwaySkill,
      Skill,
      StudentProfile,
      StudentSkill,
      MasteryRecord,
      CourseSkill,
    ]),
  ],
  controllers: [CareerPathwaysController],
  providers: [CareerPathwaysService],
  exports: [CareerPathwaysService],
})
export class CareerPathwaysModule {}
