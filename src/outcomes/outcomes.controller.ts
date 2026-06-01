import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  OutcomesService,
  OutcomeOverview,
  GraduateReport,
  EmploymentReport,
  CredentialReport,
} from './outcomes.service.js';
import { OutcomesQueryDto } from './dto/index.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/entities/user.entity.js';

@ApiTags('Outcome Reporting')
@Controller('outcomes')
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR)
export class OutcomesController {
  constructor(private readonly outcomesService: OutcomesService) {}

  @Get('overview')
  @ApiOperation({ summary: 'High-level outcome metrics: graduation rate, employment, credentials' })
  getOverview(
    @TenantId() tenantId: string,
    @Query() query: OutcomesQueryDto,
  ): Promise<OutcomeOverview> {
    return this.outcomesService.getOverview(tenantId, query);
  }

  @Get('graduates')
  @ApiOperation({ summary: 'Graduate counts, trends by month, and program completion breakdown' })
  getGraduateReport(
    @TenantId() tenantId: string,
    @Query() query: OutcomesQueryDto,
  ): Promise<GraduateReport> {
    return this.outcomesService.getGraduateReport(tenantId, query);
  }

  @Get('employment')
  @ApiOperation({ summary: 'Employment metrics: opportunity acceptance rates and placement outcomes' })
  getEmploymentReport(
    @TenantId() tenantId: string,
    @Query() query: OutcomesQueryDto,
  ): Promise<EmploymentReport> {
    return this.outcomesService.getEmploymentReport(tenantId, query);
  }

  @Get('credentials')
  @ApiOperation({ summary: 'Credential issuance statistics and credential-to-job conversion rate' })
  getCredentialReport(
    @TenantId() tenantId: string,
    @Query() query: OutcomesQueryDto,
  ): Promise<CredentialReport> {
    return this.outcomesService.getCredentialReport(tenantId, query);
  }
}
