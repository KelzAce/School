import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
name: string;

@Column({ type: 'varchar', length: 100 })
slug: string;

@Column({ type: 'varchar', length: 255, nullable: true })
domain: string | null;

@Column({ type: 'varchar', length: 500, nullable: true })
logoUrl: string | null;

@Column({ type: 'jsonb', default: {} })
settings: Record<string, unknown>;

@Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
status: TenantStatus;

@Column({ type: 'varchar', length: 100, nullable: true })
timezone: string | null;

@Column({ type: 'varchar', length: 255, nullable: true })
contactEmail: string | null;

@Column({ type: 'varchar', length: 50, nullable: true })
contactPhone: string | null;
}
