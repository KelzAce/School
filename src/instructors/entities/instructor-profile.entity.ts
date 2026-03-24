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
import { CourseAssignment } from './course-assignment.entity.js';

export enum InstructorStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  INACTIVE = 'inactive',
}

export interface Certification {
  name: string;
  issuer: string;
  dateObtained: string;
  expiryDate?: string;
}

@Entity('instructor_profiles')
@Index(['tenantId', 'employeeNumber'], { unique: true })
export class InstructorProfile extends BaseEntity {
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

  @Column({ type: 'varchar', length: 50 })
  employeeNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'jsonb', default: [] })
  specializations: string[];

  @Column({ type: 'jsonb', default: [] })
  qualifications: string[];

  @Column({ type: 'jsonb', default: [] })
  certifications: Certification[];

  @Column({ type: 'int', nullable: true })
  yearsOfExperience: number | null;

  @Column({ type: 'int', default: 0 })
  maxCourseLoad: number;

  @Column({ type: 'date', nullable: true })
  hireDate: string | null;

  @Column({
    type: 'enum',
    enum: InstructorStatus,
    default: InstructorStatus.ACTIVE,
  })
  status: InstructorStatus;

  @OneToMany(() => CourseAssignment, (ca) => ca.instructorProfile)
  courseAssignments: CourseAssignment[];
}
