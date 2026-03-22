import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { Program } from './program.entity.js';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CourseModule {
  id: string;
  title: string;
  content: string;
  order: number;
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('courses')
@Index(['tenantId', 'code'], { unique: true })
export class Course extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid', nullable: true })
  programId: string | null;

  @ManyToOne(() => Program, (program) => program.courses, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'programId' })
  program: Program | null;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 50, default: 'General' })
  learningTrack: string;

  @Column({ length: 20, default: 'beginner' })
  difficulty: Difficulty;

  @Column({ type: 'boolean', default: false })
  isAsynchronous: boolean;

  @Column({ type: 'int', nullable: true })
  credits: number | null;

  @Column({ type: 'jsonb', default: [] })
  modules: CourseModule[];

  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;
}
