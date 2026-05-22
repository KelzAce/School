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
import { Portfolio } from './portfolio.entity.js';
import { PortfolioRubric } from './portfolio-rubric.entity.js';

export enum PortfolioAssessmentStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('portfolio_assessments')
@Index(['tenantId', 'portfolioId'])
export class PortfolioAssessment extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  portfolioId: string;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolioId' })
  portfolio: Portfolio;

  @Column({ type: 'uuid', nullable: true })
  rubricId: string | null;

  @ManyToOne(() => PortfolioRubric, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'rubricId' })
  rubric: PortfolioRubric | null;

  @Column({
    type: 'enum',
    enum: PortfolioAssessmentStatus,
    default: PortfolioAssessmentStatus.IN_PROGRESS,
  })
  status: PortfolioAssessmentStatus;

  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  totalScore: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  maxPossibleScore: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  scorePercentage: number | null;

  @Column({ type: 'text', nullable: true })
  overallFeedback: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assessedBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @OneToMany(
    'PortfolioCriterionScore',
    (s: { assessment: PortfolioAssessment }) => s.assessment,
  )
  criterionScores: import('./portfolio-criterion-score.entity.js').PortfolioCriterionScore[];
}
