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
import { CohortsService } from './cohorts.service.js';
import { CreateCohortDto, UpdateCohortDto } from './dto/cohort.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Cohorts')
@Controller('cohorts')
export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a cohort' })
  @ApiResponse({ status: 201, description: 'Cohort created' })
  @ApiResponse({ status: 409, description: 'Code already exists' })
  create(@TenantId() tenantId: string, @Body() dto: CreateCohortDto) {
    return this.cohortsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all cohorts' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.cohortsService.findAll(tenantId, query);
  }

  @Get('program/:programId')
  @ApiOperation({ summary: 'List cohorts by program' })
  findByProgram(
    @TenantId() tenantId: string,
    @Param('programId', ParseUUIDPipe) programId: string,
  ) {
    return this.cohortsService.findByProgram(tenantId, programId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cohort by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cohortsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a cohort' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCohortDto,
  ) {
    return this.cohortsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a cohort' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cohortsService.remove(tenantId, id);
  }
}
