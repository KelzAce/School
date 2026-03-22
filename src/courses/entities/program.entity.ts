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
import { Course } from './course.entity.js';

export enum ProgramStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('programs')
@Index(['tenantId', 'code'], { unique: true })
export class Program extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 50, default: 'General' })
  learningTrack: string;

  @Column({ type: 'int', nullable: true })
  durationWeeks: number | null;

  @Column({ type: 'int', nullable: true })
  totalCredits: number | null;

  @Column({ type: 'enum', enum: ProgramStatus, default: ProgramStatus.DRAFT })
  status: ProgramStatus;

  @OneToMany(() => Course, (course) => course.program)
  courses: Course[];
}
