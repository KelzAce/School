import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkplaceSummaryService } from './workplace-summary.service.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Workplace Summary')
@Controller('workplace-summary')
export class WorkplaceSummaryController {
  constructor(private readonly service: WorkplaceSummaryService) {}

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get workplace learning summary for a student' })
  getStudentSummary(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.service.getStudentSummary(tenantId, studentProfileId);
  }
}
