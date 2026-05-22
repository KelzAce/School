import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PortfolioAssessmentsService } from './portfolio-assessments.service.js';
import {
  CreatePortfolioAssessmentDto,
  AddCriterionScoreDto,
  CompleteAssessmentDto,
} from './dto/portfolio-assessment.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Portfolio Assessments')
@Controller('portfolio-assessments')
export class PortfolioAssessmentsController {
  constructor(
    private readonly portfolioAssessmentsService: PortfolioAssessmentsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a portfolio assessment' })
  @ApiResponse({ status: 201, description: 'Assessment created in progress' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreatePortfolioAssessmentDto,
  ) {
    return this.portfolioAssessmentsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all portfolio assessments (paginated)' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.portfolioAssessmentsService.findAll(tenantId, query);
  }

  @Get('student/:studentProfileId/summary')
  @ApiOperation({ summary: 'Get portfolio summary for a student' })
  getSummary(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.portfolioAssessmentsService.getSummary(
      tenantId,
      studentProfileId,
    );
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({ summary: 'Get all assessments for a portfolio' })
  findByPortfolio(
    @TenantId() tenantId: string,
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
  ) {
    return this.portfolioAssessmentsService.findByPortfolio(
      tenantId,
      portfolioId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a portfolio assessment by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.portfolioAssessmentsService.findOne(tenantId, id);
  }

  @Post(':id/criterion-scores')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Add a criterion score to an assessment' })
  @ApiResponse({ status: 201, description: 'Score added' })
  addCriterionScore(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddCriterionScoreDto,
  ) {
    return this.portfolioAssessmentsService.addCriterionScore(
      tenantId,
      id,
      dto,
    );
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Complete a portfolio assessment and compute scores' })
  @ApiResponse({ status: 200, description: 'Assessment completed' })
  complete(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteAssessmentDto,
  ) {
    return this.portfolioAssessmentsService.complete(tenantId, id, dto);
  }
}
