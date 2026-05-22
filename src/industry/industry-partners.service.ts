import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndustryPartner } from './entities/industry-partner.entity.js';
import {
  CreateIndustryPartnerDto,
  UpdateIndustryPartnerDto,
} from './dto/industry-partner.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class IndustryPartnersService {
  constructor(
    @InjectRepository(IndustryPartner)
    private readonly repo: Repository<IndustryPartner>,
  ) {}

  async create(tenantId: string, dto: CreateIndustryPartnerDto): Promise<IndustryPartner> {
    const exists = await this.repo.findOne({ where: { tenantId, slug: dto.slug } });
    if (exists) {
      throw new ConflictException(`Industry partner with slug "${dto.slug}" already exists`);
    }
    const partner = this.repo.create({ tenantId, ...dto } as Partial<IndustryPartner>);
    return this.repo.save(partner);
  }

  async findAll(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<IndustryPartner>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<IndustryPartner> {
    const partner = await this.repo.findOne({ where: { id, tenantId } });
    if (!partner) {
      throw new NotFoundException(`Industry partner "${id}" not found`);
    }
    return partner;
  }

  async findBySlug(tenantId: string, slug: string): Promise<IndustryPartner> {
    const partner = await this.repo.findOne({ where: { tenantId, slug } });
    if (!partner) {
      throw new NotFoundException(`Industry partner with slug "${slug}" not found`);
    }
    return partner;
  }

  async update(tenantId: string, id: string, dto: UpdateIndustryPartnerDto): Promise<IndustryPartner> {
    const partner = await this.findOne(tenantId, id);
    Object.assign(partner, dto);
    return this.repo.save(partner);
  }

  async verify(tenantId: string, id: string): Promise<IndustryPartner> {
    const partner = await this.findOne(tenantId, id);
    partner.isVerified = true;
    partner.verifiedAt = new Date();
    return this.repo.save(partner);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const partner = await this.findOne(tenantId, id);
    await this.repo.remove(partner);
  }
}
