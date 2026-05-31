import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsQueryDto } from './dto/analytics-query.dto.js';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tenant overview dashboard (totals and top skills)' })
  @ApiResponse({ status: 200, description: 'Overview metrics' })
  getOverview(@TenantId() tenantId: string) {
    return this.analyticsService.getOverview(tenantId);
  }

  @Get('enrollment-trends')
  @ApiOperation({ summary: 'Enrollment trends over time' })
  @ApiResponse({ status: 200, description: 'Time-bucketed enrollment counts' })
  getEnrollmentTrends(
    @TenantId() tenantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getEnrollmentTrends(tenantId, query);
  }

  @Get('completion-rates')
  @ApiOperation({ summary: 'Completion rates overall and per program' })
  @ApiResponse({ status: 200, description: 'Completion rate breakdown' })
  getCompletionRates(@TenantId() tenantId: string) {
    return this.analyticsService.getCompletionRates(tenantId);
  }

  @Get('skill-velocity')
  @ApiOperation({ summary: 'Skill acquisition velocity (mastery events over time)' })
  @ApiResponse({ status: 200, description: 'Mastery counts per period' })
  getSkillVelocity(
    @TenantId() tenantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getSkillVelocity(tenantId, query);
  }

  @Get('programs/:programId')
  @ApiOperation({ summary: 'Program-specific enrollment and completion stats' })
  @ApiResponse({ status: 200, description: 'Program stats' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  getProgramStats(
    @TenantId() tenantId: string,
    @Param('programId', ParseUUIDPipe) programId: string,
  ) {
    return this.analyticsService.getProgramStats(tenantId, programId);
  }
}
