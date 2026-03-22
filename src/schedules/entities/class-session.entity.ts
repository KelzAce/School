import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { Course } from '../../courses/entities/course.entity.js';
import { InstructorProfile } from '../../instructors/entities/instructor-profile.entity.js';
import { Cohort } from './cohort.entity.js';

export enum SessionType {
  LECTURE = 'lecture',
  LAB = 'lab',
  WORKSHOP = 'workshop',
  FIELD_WORK = 'field_work',
  ASSESSMENT = 'assessment',
  ASYNC = 'async',
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('class_sessions')
@Index(['tenantId', 'cohortId', 'courseId', 'dayOfWeek', 'startTime'], {
  unique: true,
})
export class ClassSession extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  cohortId: string;

  @ManyToOne(() => Cohort, (cohort) => cohort.classSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cohortId' })
  cohort: Cohort;

  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'uuid', nullable: true })
  instructorProfileId: string | null;

  @ManyToOne(() => InstructorProfile, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'instructorProfileId' })
  instructorProfile: InstructorProfile | null;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: SessionType, default: SessionType.LECTURE })
  sessionType: SessionType;

  @Column({ length: 255, nullable: true })
  room: string | null;

  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'date', nullable: true })
  effectiveDate: string | null;

  @Column({ type: 'date', nullable: true })
  expiryDate: string | null;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;
}
