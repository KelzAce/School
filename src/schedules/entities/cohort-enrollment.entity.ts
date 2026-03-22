import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { Cohort } from './cohort.entity.js';

export enum CohortEnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
}

@Entity('cohort_enrollments')
@Index(['tenantId', 'cohortId', 'studentProfileId'], { unique: true })
export class CohortEnrollment extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  cohortId: string;

  @ManyToOne(() => Cohort, (cohort) => cohort.cohortEnrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cohortId' })
  cohort: Cohort;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  @Column({
    type: 'enum',
    enum: CohortEnrollmentStatus,
    default: CohortEnrollmentStatus.ACTIVE,
  })
  status: CohortEnrollmentStatus;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  enrolledAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
