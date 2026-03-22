import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { SkillCategory } from './skill-category.entity.js';
import { SkillType, ProficiencyLevel } from './skill-enums.js';
import { CourseSkill } from './course-skill.entity.js';

export { SkillType, ProficiencyLevel };

@Entity('skills')
@Index(['tenantId', 'code'], { unique: true })
export class Skill extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => SkillCategory, (cat) => cat.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: SkillCategory;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Skill, (skill) => skill.children, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Skill | null;

  @OneToMany(() => Skill, (skill) => skill.parent)
  children: Skill[];

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: SkillType, default: SkillType.TECHNICAL })
  type: SkillType;

  /** O*NET Standard Occupational Classification code */
  @Column({ length: 50, nullable: true })
  onetCode: string | null;

  /** European Skills, Competences, Qualifications and Occupations code */
  @Column({ length: 50, nullable: true })
  escoCode: string | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => CourseSkill, (cs) => cs.skill)
  courseSkills: CourseSkill[];
}
