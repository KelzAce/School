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
import { PortfolioService } from './portfolio.service.js';
import {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  SubmitPortfolioDto,
} from './dto/portfolio.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Portfolios')
@Controller('portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Create a new portfolio' })
  @ApiResponse({ status: 201, description: 'Portfolio created' })
  create(@TenantId() tenantId: string, @Body() dto: CreatePortfolioDto) {
    return this.portfolioService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all portfolios (paginated)' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.portfolioService.findAll(tenantId, query);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get all portfolios for a student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.portfolioService.findByStudent(tenantId, studentProfileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a portfolio by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portfolioService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update a portfolio' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(tenantId, id, dto);
  }

  @Post(':id/submit')
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit a portfolio for review' })
  @ApiResponse({ status: 200, description: 'Portfolio submitted' })
  submit(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() _dto: SubmitPortfolioDto,
  ) {
    return this.portfolioService.submit(tenantId, id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a portfolio' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portfolioService.remove(tenantId, id);
  }
}
