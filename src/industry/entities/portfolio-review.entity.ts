import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { IndustryPartner } from './industry-partner.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';

export enum HiringIntent {
  NOT_INTERESTED = 'not_interested',
  POTENTIAL = 'potential',
  INTERESTED = 'interested',
  VERY_INTERESTED = 'very_interested',
}

@Entity('partner_portfolio_reviews')
@Index(['tenantId', 'partnerId', 'portfolioId'])
export class PortfolioReview extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => IndustryPartner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner: IndustryPartner;

  @Column({ type: 'uuid' })
  portfolioId: string;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'jsonb', nullable: true })
  strengths: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  areasForImprovement: string[] | null;

  @Column({ type: 'enum', enum: HiringIntent })
  hiringIntent: HiringIntent;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  reviewedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewedBy: string | null;
}
