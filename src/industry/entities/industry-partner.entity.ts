import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { User } from '../../users/entities/user.entity.js';

export enum PartnerSize {
  STARTUP = 'startup',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

@Entity('industry_partners')
@Index(['tenantId', 'slug'], { unique: true })
export class IndustryPartner extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @OneToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 100 })
  industry: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'enum', enum: PartnerSize, default: PartnerSize.SMALL })
  size: PartnerSize;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: { linkedin?: string; twitter?: string; github?: string } | null;

  @OneToMany('Opportunity', (o: any) => o.partner)
  opportunities: import('./opportunity.entity.js').Opportunity[];

  @OneToMany('PortfolioReview', (r: any) => r.partner)
  portfolioReviews: import('./portfolio-review.entity.js').PortfolioReview[];

  @OneToMany('CredentialValidation', (v: any) => v.partner)
  credentialValidations: import('./credential-validation.entity.js').CredentialValidation[];
}
