import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WorkplaceCompetencySignOffsService } from './workplace-competency-signoffs.service.js';
import { CreateWorkplaceCompetencySignOffDto } from './dto/workplace-competency-signoff.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Workplace Competency Sign-offs')
@Controller('workplace-competency-signoffs')
export class WorkplaceCompetencySignOffsController {
  constructor(private readonly service: WorkplaceCompetencySignOffsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a competency sign-off' })
  @ApiResponse({ status: 201, description: 'Sign-off created' })
  @ApiResponse({ status: 409, description: 'Duplicate sign-off' })
  create(@TenantId() tenantId: string, @Body() dto: CreateWorkplaceCompetencySignOffDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all competency sign-offs' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('placement/:placementId')
  @ApiOperation({ summary: 'Get sign-offs for a placement' })
  findByPlacement(
    @TenantId() tenantId: string,
    @Param('placementId', ParseUUIDPipe) placementId: string,
  ) {
    return this.service.findByPlacement(tenantId, placementId);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get sign-offs for a student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.service.findByStudent(tenantId, studentProfileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a competency sign-off by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a competency sign-off' })
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
