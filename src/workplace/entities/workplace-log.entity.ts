import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { WorkplacePlacement } from './workplace-placement.entity.js';

export enum LogStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('workplace_logs')
@Index(['tenantId', 'placementId'])
@Index(['tenantId', 'studentProfileId'])
export class WorkplaceLog extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  placementId: string;

  @ManyToOne(() => WorkplacePlacement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placementId' })
  placement: WorkplacePlacement;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  @Column({ type: 'date' })
  logDate: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hoursWorked: number;

  @Column({ type: 'text' })
  activities: string;

  @Column({ type: 'text', nullable: true })
  learningReflection: string | null;

  @Column({ type: 'text', nullable: true })
  challengesFaced: string | null;

  @Column({ type: 'jsonb', default: [] })
  skillsApplied: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  attachmentUrl: string | null;

  @Column({ type: 'enum', enum: LogStatus, default: LogStatus.DRAFT })
  status: LogStatus;

  @Column({ type: 'text', nullable: true })
  supervisorFeedback: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewedBy: string | null;
}
