import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { StudentProfile } from './student-profile.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
}

@Entity('enrollments')
export class Enrollment extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, (sp) => sp.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  /** References courses.id — FK will be added when Courses module gets TypeORM */
  @Column({ type: 'uuid' })
  programId: string;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  status: EnrollmentStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  enrolledAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
