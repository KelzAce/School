import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { WorkplacePlacement } from './workplace-placement.entity.js';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

@Entity('workplace_competency_signoffs')
@Index(['tenantId', 'placementId', 'skillId'], { unique: true })
export class WorkplaceCompetencySignOff extends BaseEntity {
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

  @Column({ type: 'varchar', length: 255 })
  skillId: string;

  @Column({ type: 'varchar', length: 255 })
  skillName: string;

  @Column({ type: 'enum', enum: ProficiencyLevel })
  demonstratedLevel: ProficiencyLevel;

  @Column({ type: 'varchar', length: 255 })
  signedOffBy: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  signedOffAt: Date;

  @Column({ type: 'text', nullable: true })
  evidence: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
