import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { Course } from '../../courses/entities/course.entity.js';
import { Skill } from './skill.entity.js';
import { ProficiencyLevel } from './skill-enums.js';

@Entity('course_skills')
@Index(['tenantId', 'courseId', 'skillId'], { unique: true })
export class CourseSkill extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'uuid' })
  skillId: string;

  @ManyToOne(() => Skill, (skill) => skill.courseSkills, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  /** The proficiency level this course targets for this skill */
  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
    default: ProficiencyLevel.BEGINNER,
  })
  targetLevel: ProficiencyLevel;

  /** Whether this skill is a primary learning outcome of the course */
  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;
}
