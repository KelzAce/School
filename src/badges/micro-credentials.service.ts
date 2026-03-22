import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import {
  MicroCredential,
  CredentialStatus,
} from './entities/micro-credential.entity.js';
import {
  IssueMicroCredentialDto,
  RevokeMicroCredentialDto,
} from './dto/micro-credential.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class MicroCredentialsService {
  constructor(
    @InjectRepository(MicroCredential)
    private readonly credentialRepo: Repository<MicroCredential>,
  ) {}

  async issue(
    tenantId: string,
    dto: IssueMicroCredentialDto,
  ): Promise<MicroCredential> {
    const existing = await this.credentialRepo.findOne({
      where: { tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Micro-credential with code "${dto.code}" already exists`,
      );
    }

    const verificationHash = createHash('sha256')
      .update(
        `${tenantId}:${dto.studentProfileId}:${dto.code}:${randomBytes(16).toString('hex')}`,
      )
      .digest('hex');

    const credential = this.credentialRepo.create({
      tenantId,
      studentProfileId: dto.studentProfileId,
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
      issuerName: dto.issuerName ?? null,
      issuerUrl: dto.issuerUrl ?? null,
      badgeIds: dto.badgeIds ?? [],
      skillIds: dto.skillIds ?? [],
      creditHours: dto.creditHours ? parseFloat(dto.creditHours) : null,
      verificationHash,
      issuedBy: dto.issuedBy ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      metadata: dto.metadata ?? null,
    } as Partial<MicroCredential>);

    return this.credentialRepo.save(credential);
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<MicroCredential>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.credentialRepo.findAndCount({
      where: { tenantId },
      relations: ['studentProfile'],
      order: { issuedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<MicroCredential> {
    const credential = await this.credentialRepo.findOne({
      where: { id, tenantId },
      relations: ['studentProfile'],
    });
    if (!credential) {
      throw new NotFoundException(`Micro-credential "${id}" not found`);
    }
    return credential;
  }

  async findByStudent(
    tenantId: string,
    studentProfileId: string,
  ): Promise<MicroCredential[]> {
    return this.credentialRepo.find({
      where: { tenantId, studentProfileId, status: CredentialStatus.ACTIVE },
      order: { issuedAt: 'DESC' },
    });
  }

  async verify(hash: string): Promise<MicroCredential | null> {
    return this.credentialRepo.findOne({
      where: { verificationHash: hash },
      relations: ['studentProfile'],
    });
  }

  async revoke(
    tenantId: string,
    id: string,
    dto: RevokeMicroCredentialDto,
  ): Promise<MicroCredential> {
    const credential = await this.findOne(tenantId, id);
    credential.status = CredentialStatus.REVOKED;
    credential.revokedAt = new Date();
    credential.revocationReason = dto.reason;
    return this.credentialRepo.save(credential);
  }
}
