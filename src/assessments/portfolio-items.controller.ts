import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PortfolioItemsService } from './portfolio-items.service.js';
import {
  CreatePortfolioItemDto,
  UpdatePortfolioItemDto,
} from './dto/portfolio-item.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Portfolio Items')
@Controller('portfolio-items')
export class PortfolioItemsController {
  constructor(private readonly portfolioItemsService: PortfolioItemsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Add an item to a portfolio' })
  @ApiResponse({ status: 201, description: 'Item added' })
  create(@TenantId() tenantId: string, @Body() dto: CreatePortfolioItemDto) {
    return this.portfolioItemsService.create(tenantId, dto);
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({ summary: 'Get all items in a portfolio' })
  findByPortfolio(
    @TenantId() tenantId: string,
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
  ) {
    return this.portfolioItemsService.findByPortfolio(tenantId, portfolioId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a portfolio item by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portfolioItemsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a portfolio item' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortfolioItemDto,
  ) {
    return this.portfolioItemsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a portfolio item' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portfolioItemsService.remove(tenantId, id);
  }
}
