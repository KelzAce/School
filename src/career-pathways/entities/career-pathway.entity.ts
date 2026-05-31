import { Column, Entity, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { CareerPathwaySkill } from './career-pathway-skill.entity.js';

@Entity('career_pathways')
@Index(['tenantId', 'slug'], { unique: true })
export class CareerPathway extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sector: string | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => CareerPathwaySkill, (cps) => cps.pathway)
  pathwaySkills: CareerPathwaySkill[];
}
