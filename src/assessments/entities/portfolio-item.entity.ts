import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { Portfolio } from './portfolio.entity.js';

export enum PortfolioItemType {
  ARTIFACT = 'artifact',
  REFLECTION = 'reflection',
  EVIDENCE = 'evidence',
  PROJECT = 'project',
  CERTIFICATE = 'certificate',
  MEDIA = 'media',
}

@Entity('portfolio_items')
@Index(['tenantId', 'portfolioId'])
export class PortfolioItem extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  portfolioId: string;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolioId' })
  portfolio: Portfolio;

  @Column({ type: 'enum', enum: PortfolioItemType })
  type: PortfolioItemType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  externalUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
