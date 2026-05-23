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
import { SupervisorAssessmentsService } from './supervisor-assessments.service.js';
import { CreateSupervisorAssessmentDto, UpdateSupervisorAssessmentDto } from './dto/supervisor-assessment.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Supervisor Assessments')
@Controller('supervisor-assessments')
export class SupervisorAssessmentsController {
  constructor(private readonly service: SupervisorAssessmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a supervisor assessment' })
  @ApiResponse({ status: 201, description: 'Assessment created' })
  create(@TenantId() tenantId: string, @Body() dto: CreateSupervisorAssessmentDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all supervisor assessments' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('placement/:placementId')
  @ApiOperation({ summary: 'Get assessments for a placement' })
  findByPlacement(
    @TenantId() tenantId: string,
    @Param('placementId', ParseUUIDPipe) placementId: string,
  ) {
    return this.service.findByPlacement(tenantId, placementId);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get assessments for a student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.service.findByStudent(tenantId, studentProfileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supervisor assessment by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update a supervisor assessment' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupervisorAssessmentDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a supervisor assessment' })
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
