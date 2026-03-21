import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { Enrollment } from './enrollment.entity.js';

export type LearningTrack =
  | 'STEM'
  | 'Arts'
  | 'Entrepreneurship'
  | 'Trades'
  | 'General';

export enum StudentStatus {
  APPLICANT = 'applicant',
  ENROLLED = 'enrolled',
  GRADUATED = 'graduated',
  WITHDRAWN = 'withdrawn',
  SUSPENDED = 'suspended',
}

@Entity('student_profiles')
@Index(['tenantId', 'studentNumber'], { unique: true })
export class StudentProfile extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 50 })
  studentNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ length: 500, nullable: true })
  address: string | null;

  @Column({ type: 'jsonb', nullable: true })
  emergencyContact: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  careerAspirations: string | null;

  @Column({ type: 'jsonb', nullable: true })
  priorCompetencies: string[] | null;

  @Column({ length: 50, default: 'General' })
  learningTrack: LearningTrack;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.APPLICANT })
  status: StudentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  enrollmentDate: Date | null;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.studentProfile)
  enrollments: Enrollment[];
}
