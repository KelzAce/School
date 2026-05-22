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
import { PortfolioRubricsService } from './portfolio-rubrics.service.js';
import {
  CreatePortfolioRubricDto,
  UpdatePortfolioRubricDto,
} from './dto/portfolio-rubric.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Portfolio Rubrics')
@Controller('portfolio-rubrics')
export class PortfolioRubricsController {
  constructor(
    private readonly portfolioRubricsService: PortfolioRubricsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a portfolio rubric' })
  @ApiResponse({ status: 201, description: 'Rubric created' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreatePortfolioRubricDto,
  ) {
    return this.portfolioRubricsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all portfolio rubrics (paginated)' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.portfolioRubricsService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a portfolio rubric by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portfolioRubricsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a portfolio rubric' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortfolioRubricDto,
  ) {
    return this.portfolioRubricsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a portfolio rubric' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portfolioRubricsService.remove(tenantId, id);
  }
}
