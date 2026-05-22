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
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { Course } from '../../courses/entities/course.entity.js';

export enum PortfolioStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  REVIEWED = 'reviewed',
  ARCHIVED = 'archived',
}

@Entity('portfolios')
@Index(['tenantId', 'studentProfileId'])
export class Portfolio extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  @Column({ type: 'uuid', nullable: true })
  courseId: string | null;

  @ManyToOne(() => Course, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: PortfolioStatus, default: PortfolioStatus.DRAFT })
  status: PortfolioStatus;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @OneToMany('PortfolioItem', (item: { portfolio: Portfolio }) => item.portfolio)
  items: import('./portfolio-item.entity.js').PortfolioItem[];

  @OneToMany(
    'PortfolioAssessment',
    (a: { portfolio: Portfolio }) => a.portfolio,
  )
  assessments: import('./portfolio-assessment.entity.js').PortfolioAssessment[];
}
