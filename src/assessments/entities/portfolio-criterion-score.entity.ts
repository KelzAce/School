import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { PortfolioAssessment } from './portfolio-assessment.entity.js';
import { PortfolioRubricCriterion } from './portfolio-rubric-criterion.entity.js';

@Entity('portfolio_criterion_scores')
@Index(['assessmentId'])
export class PortfolioCriterionScore extends BaseEntity {
  @Column({ type: 'uuid' })
  assessmentId: string;

  @ManyToOne(() => PortfolioAssessment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessmentId' })
  assessment: PortfolioAssessment;

  @Column({ type: 'uuid', nullable: true })
  criterionId: string | null;

  @ManyToOne(() => PortfolioRubricCriterion, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'criterionId' })
  criterion: PortfolioRubricCriterion | null;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;
}
