import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillCategory } from './entities/skill-category.entity.js';
import { Skill } from './entities/skill.entity.js';
import { CourseSkill } from './entities/course-skill.entity.js';
import { StudentSkill } from './entities/student-skill.entity.js';
import { SkillCategoriesService } from './skill-categories.service.js';
import { SkillsService } from './skills.service.js';
import { SkillMappingsService } from './skill-mappings.service.js';
import { SkillCategoriesController } from './skill-categories.controller.js';
import { SkillsController } from './skills.controller.js';
import { SkillMappingsController } from './skill-mappings.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SkillCategory,
      Skill,
      CourseSkill,
      StudentSkill,
    ]),
  ],
  controllers: [
    SkillCategoriesController,
    SkillsController,
    SkillMappingsController,
  ],
  providers: [SkillCategoriesService, SkillsService, SkillMappingsService],
  exports: [SkillCategoriesService, SkillsService, SkillMappingsService],
})
export class SkillsModule {}
