import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PortfolioReviewsService } from './portfolio-reviews.service.js';
import {
  CreatePortfolioReviewDto,
  UpdatePortfolioReviewDto,
} from './dto/portfolio-review.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Partner Portfolio Reviews')
@Controller('partner-portfolio-reviews')
export class PortfolioReviewsController {
  constructor(private readonly service: PortfolioReviewsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a portfolio review' })
  @ApiResponse({ status: 201, description: 'Portfolio review created' })
  create(@TenantId() tenantId: string, @Body() dto: CreatePortfolioReviewDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all portfolio reviews (paginated)' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({ summary: 'Get reviews for a portfolio' })
  findByPortfolio(
    @TenantId() tenantId: string,
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
  ) {
    return this.service.findByPortfolio(tenantId, portfolioId);
  }

  @Get('partner/:partnerId')
  @ApiOperation({ summary: 'Get reviews by partner' })
  findByPartner(
    @TenantId() tenantId: string,
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
  ) {
    return this.service.findByPartner(tenantId, partnerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get portfolio review by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a portfolio review' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortfolioReviewDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a portfolio review' })
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
