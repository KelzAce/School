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
import { OpportunityApplicationsService } from './opportunity-applications.service.js';
import {
  CreateOpportunityApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/opportunity-application.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Opportunity Applications')
@Controller('opportunity-applications')
export class OpportunityApplicationsController {
  constructor(private readonly service: OpportunityApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an application to an opportunity' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  @ApiResponse({ status: 409, description: 'Already applied' })
  create(@TenantId() tenantId: string, @Body() dto: CreateOpportunityApplicationDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all applications (paginated)' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('opportunity/:opportunityId')
  @ApiOperation({ summary: 'Get applications for an opportunity' })
  findByOpportunity(
    @TenantId() tenantId: string,
    @Param('opportunityId', ParseUUIDPipe) opportunityId: string,
  ) {
    return this.service.findByOpportunity(tenantId, opportunityId);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get applications by student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.service.findByStudent(tenantId, studentProfileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update application status' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.service.updateStatus(tenantId, id, dto);
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw an application' })
  withdraw(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.withdraw(tenantId, id);
  }
}
