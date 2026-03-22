import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { BadgeTemplate } from './badge-template.entity.js';

export enum BadgeStatus {
  ISSUED = 'issued',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

/**
 * An issued badge instance — the concrete credential a student holds.
 * Aligned with Open Badges v3 Achievement / Credential structure.
 */
@Entity('issued_badges')
@Index(['tenantId', 'studentProfileId', 'badgeTemplateId'], { unique: true })
@Index(['verificationHash'], { unique: true })
export class IssuedBadge extends BaseEntity {
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

  @Column({ type: 'uuid' })
  badgeTemplateId: string;

  @ManyToOne(() => BadgeTemplate, (bt) => bt.issuedBadges, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'badgeTemplateId' })
  badgeTemplate: BadgeTemplate;

  @Column({ type: 'enum', enum: BadgeStatus, default: BadgeStatus.ISSUED })
  status: BadgeStatus;

  /** SHA-256 hash for verification — unique per issuance */
  @Column({ length: 64 })
  verificationHash: string;

  /** Public verification URL */
  @Column({ length: 500, nullable: true })
  verificationUrl: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  revocationReason: string | null;

  /** JSON evidence of mastery at issuance time */
  @Column({ type: 'jsonb', nullable: true })
  evidence: Array<{
    type: string;
    description: string;
    url?: string;
  }> | null;

  @Column({ length: 255, nullable: true })
  issuedBy: string | null;
}
