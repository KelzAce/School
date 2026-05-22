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
import { Course } from '../../courses/entities/course.entity.js';

@Entity('portfolio_rubrics')
@Index(['tenantId', 'name'], { unique: true })
export class PortfolioRubric extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  courseId: string | null;

  @ManyToOne(() => Course, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(
    'PortfolioRubricCriterion',
    (c: { rubric: PortfolioRubric }) => c.rubric,
    { cascade: true },
  )
  criteria: import('./portfolio-rubric-criterion.entity.js').PortfolioRubricCriterion[];

  @OneToMany(
    'PortfolioAssessment',
    (a: { rubric: PortfolioRubric }) => a.rubric,
  )
  assessments: import('./portfolio-assessment.entity.js').PortfolioAssessment[];
}
