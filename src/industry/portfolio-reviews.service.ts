import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioReview } from './entities/portfolio-review.entity.js';
import {
  CreatePortfolioReviewDto,
  UpdatePortfolioReviewDto,
} from './dto/portfolio-review.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

@Injectable()
export class PortfolioReviewsService {
  constructor(
    @InjectRepository(PortfolioReview)
    private readonly repo: Repository<PortfolioReview>,
  ) {}

  async create(tenantId: string, dto: CreatePortfolioReviewDto): Promise<PortfolioReview> {
    const review = this.repo.create({ tenantId, ...dto } as Partial<PortfolioReview>);
    return this.repo.save(review);
  }

  async findAll(tenantId: string, query: PaginationQueryDto): Promise<PaginatedResult<PortfolioReview>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId },
      order: { reviewedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string): Promise<PortfolioReview> {
    const review = await this.repo.findOne({ where: { id, tenantId } });
    if (!review) {
      throw new NotFoundException(`Portfolio review "${id}" not found`);
    }
    return review;
  }

  async findByPortfolio(tenantId: string, portfolioId: string): Promise<PortfolioReview[]> {
    return this.repo.find({ where: { tenantId, portfolioId }, order: { reviewedAt: 'DESC' } });
  }

  async findByPartner(tenantId: string, partnerId: string): Promise<PortfolioReview[]> {
    return this.repo.find({ where: { tenantId, partnerId }, order: { reviewedAt: 'DESC' } });
  }

  async update(tenantId: string, id: string, dto: UpdatePortfolioReviewDto): Promise<PortfolioReview> {
    const review = await this.findOne(tenantId, id);
    Object.assign(review, dto);
    return this.repo.save(review);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const review = await this.findOne(tenantId, id);
    await this.repo.remove(review);
  }
}
