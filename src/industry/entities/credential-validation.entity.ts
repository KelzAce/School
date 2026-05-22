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

export enum CredentialType {
  BADGE = 'badge',
  MICRO_CREDENTIAL = 'micro_credential',
  CERTIFICATE = 'certificate',
}

export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('credential_validations')
@Index(['tenantId', 'partnerId', 'credentialId'])
export class CredentialValidation extends BaseEntity {
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

  @Column({ type: 'enum', enum: CredentialType })
  credentialType: CredentialType;

  @Column({ type: 'uuid' })
  credentialId: string;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  @Column({ type: 'enum', enum: ValidationStatus, default: ValidationStatus.PENDING })
  status: ValidationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  validatedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  validatedBy: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;
}
