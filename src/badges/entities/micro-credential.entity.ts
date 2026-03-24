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

export enum CredentialStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

/**
 * A stackable micro-credential that bundles multiple badges/skills
 * into a higher-level verifiable credential.
 */
@Entity('micro_credentials')
@Index(['tenantId', 'code'], { unique: true })
@Index(['verificationHash'], { unique: true })
export class MicroCredential extends BaseEntity {
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

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Issuer details for CLR/Open Badges */
  @Column({ type: 'varchar', length: 255, nullable: true })
issuerName: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  issuerUrl: string | null;

  /** Badge IDs that compose this credential */
  @Column({ type: 'jsonb', default: [] })
  badgeIds: string[];

  /** Skill IDs that contribute to this credential */
  @Column({ type: 'jsonb', default: [] })
  skillIds: string[];

  /** Credit hours or units associated */
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  creditHours: number | null;

  @Column({ type: 'enum', enum: CredentialStatus, default: CredentialStatus.ACTIVE })
  status: CredentialStatus;

  @Column({ length: 64 })
  verificationHash: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  verificationUrl: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  revocationReason: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuedBy: string | null;

  /** Metadata: certifying body, accreditation, etc. */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;
}
