import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { BadgeTemplate } from './entities/badge-template.entity.js';
import { IssuedBadge, BadgeStatus } from './entities/issued-badge.entity.js';
import {
  CreateBadgeTemplateDto,
  UpdateBadgeTemplateDto,
} from './dto/badge-template.dto.js';
import { IssueBadgeDto, RevokeBadgeDto } from './dto/issued-badge.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(BadgeTemplate)
    private readonly templateRepo: Repository<BadgeTemplate>,
    @InjectRepository(IssuedBadge)
    private readonly issuedRepo: Repository<IssuedBadge>,
  ) {}

  /* ---------- Badge Templates ---------- */

  async createTemplate(
    tenantId: string,
    dto: CreateBadgeTemplateDto,
  ): Promise<BadgeTemplate> {
    const exists = await this.templateRepo.findOne({
      where: { tenantId, code: dto.code },
    });
    if (exists) {
      throw new ConflictException(
        `Badge template with code "${dto.code}" already exists`,
      );
    }
    const template = this.templateRepo.create({
      tenantId,
      ...dto,
    } as Partial<BadgeTemplate>);
    return this.templateRepo.save(template);
  }

  async findAllTemplates(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<BadgeTemplate>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.templateRepo.findAndCount({
      where: { tenantId },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneTemplate(tenantId: string, id: string): Promise<BadgeTemplate> {
    const template = await this.templateRepo.findOne({
      where: { id, tenantId },
    });
    if (!template) {
      throw new NotFoundException(`Badge template "${id}" not found`);
    }
    return template;
  }

  async updateTemplate(
    tenantId: string,
    id: string,
    dto: UpdateBadgeTemplateDto,
  ): Promise<BadgeTemplate> {
    const template = await this.findOneTemplate(tenantId, id);
    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async removeTemplate(tenantId: string, id: string): Promise<void> {
    const template = await this.findOneTemplate(tenantId, id);
    await this.templateRepo.remove(template);
  }

  /* ---------- Issued Badges ---------- */

  async issueBadge(
    tenantId: string,
    dto: IssueBadgeDto,
  ): Promise<IssuedBadge> {
    // Verify template exists
    await this.findOneTemplate(tenantId, dto.badgeTemplateId);

    // Check if already issued to this student
    const existing = await this.issuedRepo.findOne({
      where: {
        tenantId,
        studentProfileId: dto.studentProfileId,
        badgeTemplateId: dto.badgeTemplateId,
      },
    });
    if (existing && existing.status === BadgeStatus.ISSUED) {
      throw new ConflictException(
        'This badge has already been issued to the student',
      );
    }

    const verificationHash = createHash('sha256')
      .update(
        `${tenantId}:${dto.studentProfileId}:${dto.badgeTemplateId}:${randomBytes(16).toString('hex')}`,
      )
      .digest('hex');

    const badge = this.issuedRepo.create({
      tenantId,
      studentProfileId: dto.studentProfileId,
      badgeTemplateId: dto.badgeTemplateId,
      verificationHash,
      evidence: dto.evidence ?? null,
      issuedBy: dto.issuedBy ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    } as Partial<IssuedBadge>);

    return this.issuedRepo.save(badge);
  }

  async findAllIssued(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<IssuedBadge>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.issuedRepo.findAndCount({
      where: { tenantId },
      relations: ['badgeTemplate', 'studentProfile'],
      order: { issuedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findIssuedByStudent(
    tenantId: string,
    studentProfileId: string,
  ): Promise<IssuedBadge[]> {
    return this.issuedRepo.find({
      where: { tenantId, studentProfileId, status: BadgeStatus.ISSUED },
      relations: ['badgeTemplate'],
      order: { issuedAt: 'DESC' },
    });
  }

  async findOneIssued(tenantId: string, id: string): Promise<IssuedBadge> {
    const badge = await this.issuedRepo.findOne({
      where: { id, tenantId },
      relations: ['badgeTemplate', 'studentProfile'],
    });
    if (!badge) {
      throw new NotFoundException(`Issued badge "${id}" not found`);
    }
    return badge;
  }

  async verifyBadge(hash: string): Promise<IssuedBadge | null> {
    return this.issuedRepo.findOne({
      where: { verificationHash: hash },
      relations: ['badgeTemplate', 'studentProfile'],
    });
  }

  async revokeBadge(
    tenantId: string,
    id: string,
    dto: RevokeBadgeDto,
  ): Promise<IssuedBadge> {
    const badge = await this.findOneIssued(tenantId, id);
    badge.status = BadgeStatus.REVOKED;
    badge.revokedAt = new Date();
    badge.revocationReason = dto.reason;
    return this.issuedRepo.save(badge);
  }
}
