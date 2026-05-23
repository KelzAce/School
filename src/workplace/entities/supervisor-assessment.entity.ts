import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { WorkplacePlacement } from './workplace-placement.entity.js';

export enum SupervisorRating {
  UNSATISFACTORY = 'unsatisfactory',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  SATISFACTORY = 'satisfactory',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

@Entity('supervisor_assessments')
@Index(['tenantId', 'placementId'])
export class SupervisorAssessment extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  placementId: string;

  @ManyToOne(() => WorkplacePlacement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placementId' })
  placement: WorkplacePlacement;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  @Column({ type: 'varchar', length: 100 })
  assessmentPeriod: string;

  @Column({ type: 'varchar', length: 255 })
  assessedBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assessedByEmail: string | null;

  @Column({ type: 'enum', enum: SupervisorRating })
  overallRating: SupervisorRating;

  @Column({ type: 'enum', enum: SupervisorRating })
  technicalSkillsRating: SupervisorRating;

  @Column({ type: 'enum', enum: SupervisorRating })
  communicationRating: SupervisorRating;

  @Column({ type: 'enum', enum: SupervisorRating })
  teamworkRating: SupervisorRating;

  @Column({ type: 'enum', enum: SupervisorRating })
  initiativeRating: SupervisorRating;

  @Column({ type: 'enum', enum: SupervisorRating })
  reliabilityRating: SupervisorRating;

  @Column({ type: 'text', nullable: true })
  strengths: string | null;

  @Column({ type: 'text', nullable: true })
  areasForImprovement: string | null;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @Column({ type: 'boolean', nullable: true })
  isRecommendedForHire: boolean | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assessedAt: Date;
}
