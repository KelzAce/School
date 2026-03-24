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

export enum BadgeLevel {
  FOUNDATION = 'foundation',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

/**
 * Defines a reusable badge template that can be issued to students.
 * Aligned with Open Badges v3 / CLR standard.
 */
@Entity('badge_templates')
@Index(['tenantId', 'code'], { unique: true })
export class BadgeTemplate extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** URL to the badge image (PNG/SVG) */
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'enum', enum: BadgeLevel, default: BadgeLevel.FOUNDATION })
  level: BadgeLevel;

  /** JSON criteria: skills required, min proficiency levels, etc. */
  @Column({ type: 'jsonb', default: [] })
  skillRequirements: Array<{
    skillId: string;
    minLevel: string;
  }>;

  /** Free-text issuance criteria for display */
  @Column({ type: 'text', nullable: true })
  criteria: string | null;

  /** Issuer name (school/org) for Open Badges */
  @Column({ type: 'varchar', length: 255, nullable: true })
  issuerName: string | null;

  /** Issuer URL for Open Badges verification */
 @Column({ type: 'varchar', length: 500, nullable: true })
issuerUrl: string | null;

  /** Tags for search and categorisation */
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(
    'IssuedBadge',
    (ib: { badgeTemplate: BadgeTemplate }) => ib.badgeTemplate,
  )
  issuedBadges: import('./issued-badge.entity.js').IssuedBadge[];
}
