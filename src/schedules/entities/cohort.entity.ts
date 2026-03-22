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
import { Program } from '../../courses/entities/program.entity.js';

export enum CohortStatus {
  FORMING = 'forming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('cohorts')
@Index(['tenantId', 'code'], { unique: true })
export class Cohort extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  programId: string;

  @ManyToOne(() => Program, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programId' })
  program: Program;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'int', default: 30 })
  maxCapacity: number;

  @Column({ type: 'enum', enum: CohortStatus, default: CohortStatus.FORMING })
  status: CohortStatus;

  @OneToMany(
    'ClassSession',
    (session: { cohort: Cohort }) => session.cohort,
  )
  classSessions: import('./class-session.entity.js').ClassSession[];

  @OneToMany(
    'CohortEnrollment',
    (ce: { cohort: Cohort }) => ce.cohort,
  )
  cohortEnrollments: import('./cohort-enrollment.entity.js').CohortEnrollment[];
}
