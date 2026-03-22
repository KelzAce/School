import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { Skill } from './skill.entity.js';
import { ProficiencyLevel } from './skill-enums.js';

@Entity('student_skills')
@Index(['tenantId', 'studentProfileId', 'skillId'], { unique: true })
export class StudentSkill extends BaseEntity {
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

  /** Current demonstrated proficiency level */
  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
    default: ProficiencyLevel.NOVICE,
  })
  currentLevel: ProficiencyLevel;

  /** How the proficiency was verified */
  @Column({ length: 50, nullable: true })
  verifiedBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
