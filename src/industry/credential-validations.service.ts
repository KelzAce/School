import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialValidation } from './entities/credential-validation.entity.js';
import {
  CreateCredentialValidationDto,
  UpdateValidationStatusDto,
} from './dto/credential-validation.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class CredentialValidationsService {
  constructor(
    @InjectRepository(CredentialValidation)
    private readonly repo: Repository<CredentialValidation>,
  ) {}

  async create(tenantId: string, dto: CreateCredentialValidationDto): Promise<CredentialValidation> {
    const existing = await this.repo.findOne({
      where: { tenantId, partnerId: dto.partnerId, credentialId: dto.credentialId },
    });
    if (existing) {
      throw new ConflictException('This credential has already been validated by this partner');
    }
    const validation = this.repo.create({
      tenantId,
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    } as Partial<CredentialValidation>);
    return this.repo.save(validation);
  }

  async findAll(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<CredentialValidation>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<CredentialValidation> {
    const validation = await this.repo.findOne({ where: { id, tenantId } });
    if (!validation) {
      throw new NotFoundException(`Credential validation "${id}" not found`);
    }
    return validation;
  }

  async findByPartner(tenantId: string, partnerId: string): Promise<CredentialValidation[]> {
    return this.repo.find({ where: { tenantId, partnerId }, order: { createdAt: 'DESC' } });
  }

  async findByStudent(tenantId: string, studentProfileId: string): Promise<CredentialValidation[]> {
    return this.repo.find({ where: { tenantId, studentProfileId }, order: { createdAt: 'DESC' } });
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateValidationStatusDto): Promise<CredentialValidation> {
    const validation = await this.findOne(tenantId, id);
    validation.status = dto.status;
    if (dto.validatedBy !== undefined) validation.validatedBy = dto.validatedBy ?? null;
    if (dto.notes !== undefined) validation.notes = dto.notes ?? null;
    if (dto.status === 'validated') {
      validation.validatedAt = new Date();
    }
    return this.repo.save(validation);
  }
}
