import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { CareerPathway } from './career-pathway.entity.js';
import { Skill } from '../../skills/entities/skill.entity.js';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

@Entity('career_pathway_skills')
@Index(['pathwayId', 'skillId'], { unique: true })
export class CareerPathwaySkill extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  pathwayId: string;

  @ManyToOne(() => CareerPathway, (pathway) => pathway.pathwaySkills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pathwayId' })
  pathway: CareerPathway;

  @Column({ type: 'uuid' })
  skillId: string;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @Column({ type: 'enum', enum: ProficiencyLevel, default: ProficiencyLevel.BEGINNER })
  requiredLevel: ProficiencyLevel;

  @Column({ type: 'boolean', default: false })
  isCritical: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
