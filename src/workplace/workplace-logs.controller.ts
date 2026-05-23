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
import { WorkplaceLogsService } from './workplace-logs.service.js';
import { CreateWorkplaceLogDto, UpdateWorkplaceLogDto, ReviewLogDto } from './dto/workplace-log.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Workplace Logs')
@Controller('workplace-logs')
export class WorkplaceLogsController {
  constructor(private readonly service: WorkplaceLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a workplace log entry' })
  @ApiResponse({ status: 201, description: 'Log created' })
  create(@TenantId() tenantId: string, @Body() dto: CreateWorkplaceLogDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all workplace logs' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('placement/:placementId')
  @ApiOperation({ summary: 'Get logs for a placement' })
  findByPlacement(
    @TenantId() tenantId: string,
    @Param('placementId', ParseUUIDPipe) placementId: string,
  ) {
    return this.service.findByPlacement(tenantId, placementId);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get logs for a student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.service.findByStudent(tenantId, studentProfileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workplace log by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workplace log' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkplaceLogDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Review a workplace log' })
  review(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewLogDto,
  ) {
    return this.service.review(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workplace log' })
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
