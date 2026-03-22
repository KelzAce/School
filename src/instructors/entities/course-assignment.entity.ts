import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { InstructorProfile } from './instructor-profile.entity.js';
import { Course } from '../../courses/entities/course.entity.js';

export enum AssignmentRole {
  PRIMARY = 'primary',
  ASSISTANT = 'assistant',
  GUEST = 'guest',
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn',
}

@Entity('course_assignments')
@Index(['tenantId', 'instructorProfileId', 'courseId'], { unique: true })
export class CourseAssignment extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  instructorProfileId: string;

  @ManyToOne(() => InstructorProfile, (ip) => ip.courseAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'instructorProfileId' })
  instructorProfile: InstructorProfile;

  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({
    type: 'enum',
    enum: AssignmentRole,
    default: AssignmentRole.PRIMARY,
  })
  role: AssignmentRole;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE,
  })
  status: AssignmentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  assignedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
