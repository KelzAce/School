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
import { IndustryPartner } from './industry-partner.entity.js';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

export enum OpportunityType {
  INTERNSHIP = 'internship',
  APPRENTICESHIP = 'apprenticeship',
  JOB = 'job',
  PROJECT = 'project',
  MENTORSHIP = 'mentorship',
}

export enum OpportunityStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  CLOSED = 'closed',
  FILLED = 'filled',
}

@Entity('opportunities')
@Index(['tenantId', 'partnerId'])
export class Opportunity extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  partnerId: string;

  @ManyToOne(() => IndustryPartner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partnerId' })
  partner: IndustryPartner;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: OpportunityType })
  type: OpportunityType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'boolean', default: false })
  isRemote: boolean;

  @Column({ type: 'jsonb', default: [] })
  requiredSkillIds: string[];

  @Column({ type: 'enum', enum: ProficiencyLevel, nullable: true })
  requiredLevel: ProficiencyLevel | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  duration: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stipend: string | null;

  @Column({ type: 'int', default: 1 })
  openings: number;

  @Column({ type: 'enum', enum: OpportunityStatus, default: OpportunityStatus.DRAFT })
  status: OpportunityStatus;

  @Column({ type: 'timestamptz', nullable: true })
  applicationDeadline: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @Column({ type: 'text', nullable: true })
  requirements: string | null;

  @Column({ type: 'text', nullable: true })
  benefits: string | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @OneToMany('OpportunityApplication', (a: any) => a.opportunity)
  applications: import('./opportunity-application.entity.js').OpportunityApplication[];
}
