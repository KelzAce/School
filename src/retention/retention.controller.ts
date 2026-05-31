import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RetentionService, RetentionAlert, RetentionSummary } from './retention.service.js';
import { RetentionQueryDto } from './dto/index.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/entities/user.entity.js';

@ApiTags('Retention Alerts')
@Controller('retention')
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR)
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Get('alerts/summary')
  @ApiOperation({ summary: 'Get tenant-wide retention risk summary (counts per risk level)' })
  getSummary(@TenantId() tenantId: string): Promise<RetentionSummary> {
    return this.retentionService.getSummary(tenantId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'List at-risk students with retention alerts, sorted by risk score' })
  getAlerts(
    @TenantId() tenantId: string,
    @Query() query: RetentionQueryDto,
  ): Promise<RetentionAlert[]> {
    return this.retentionService.getAlerts(tenantId, query);
  }

  @Get('alerts/:studentProfileId')
  @ApiOperation({ summary: 'Get detailed retention alert for a specific student' })
  getStudentAlert(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ): Promise<RetentionAlert> {
    return this.retentionService.getStudentAlert(tenantId, studentProfileId);
  }
}
