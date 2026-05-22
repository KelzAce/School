import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { PortfolioRubric } from './portfolio-rubric.entity.js';

@Entity('portfolio_rubric_criteria')
@Index(['rubricId'])
export class PortfolioRubricCriterion extends BaseEntity {
  @Column({ type: 'uuid' })
  rubricId: string;

  @ManyToOne(() => PortfolioRubric, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rubricId' })
  rubric: PortfolioRubric;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  weight: number;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(
    'PortfolioCriterionScore',
    (s: { criterion: PortfolioRubricCriterion }) => s.criterion,
  )
  scores: import('./portfolio-criterion-score.entity.js').PortfolioCriterionScore[];
}
