import { Column, Entity, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { Course } from '../../courses/entities/course.entity.js';

export enum PlacementType {
  INTERNSHIP = 'internship',
  APPRENTICESHIP = 'apprenticeship',
  WORK_EXPERIENCE = 'work_experience',
  PROJECT_PLACEMENT = 'project_placement',
  MENTORSHIP = 'mentorship',
}

export enum PlacementStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
  DEFERRED = 'deferred',
}

@Entity('workplace_placements')
@Index(['tenantId', 'studentProfileId', 'partnerId'])
export class WorkplacePlacement extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  @Column({ type: 'varchar', length: 255 })
  partnerId: string;

  @Column({ type: 'varchar', length: 255 })
  partnerName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supervisorName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supervisorEmail: string | null;

  @Column({ type: 'uuid', nullable: true })
  courseId: string | null;

  @ManyToOne(() => Course, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: PlacementType })
  type: PlacementType;

  @Column({ type: 'enum', enum: PlacementStatus, default: PlacementStatus.PENDING })
  status: PlacementStatus;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'int', nullable: true })
  totalHoursRequired: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  totalHoursLogged: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'boolean', default: false })
  isRemote: boolean;

  @Column({ type: 'jsonb', default: [] })
  objectives: string[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @OneToMany('WorkplaceLog', (log: any) => log.placement)
  logs: import('./workplace-log.entity.js').WorkplaceLog[];

  @OneToMany('SupervisorAssessment', (a: any) => a.placement)
  supervisorAssessments: import('./supervisor-assessment.entity.js').SupervisorAssessment[];

  @OneToMany('WorkplaceCompetencySignOff', (s: any) => s.placement)
  competencySignOffs: import('./workplace-competency-signoff.entity.js').WorkplaceCompetencySignOff[];
}
