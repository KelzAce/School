import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { Skill } from '../../skills/entities/skill.entity.js';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

@Entity('mastery_records')
@Index(['tenantId', 'studentProfileId', 'skillId', 'level'], { unique: true })
export class MasteryRecord extends BaseEntity {
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

  @Column({ type: 'uuid' })
  skillId: string;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @Column({ type: 'enum', enum: ProficiencyLevel })
  level: ProficiencyLevel;

  @Column({ type: 'uuid', nullable: true })
  assessmentId: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  achievedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
