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
import { ClassSessionsService } from './class-sessions.service.js';
import {
  CreateClassSessionDto,
  UpdateClassSessionDto,
} from './dto/class-session.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Class Sessions')
@Controller('class-sessions')
export class ClassSessionsController {
  constructor(
    private readonly classSessionsService: ClassSessionsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a class session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  @ApiResponse({ status: 409, description: 'Schedule conflict' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateClassSessionDto,
  ) {
    return this.classSessionsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all class sessions' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.classSessionsService.findAll(tenantId, query);
  }

  @Get('cohort/:cohortId')
  @ApiOperation({ summary: 'List sessions by cohort' })
  findByCohort(
    @TenantId() tenantId: string,
    @Param('cohortId', ParseUUIDPipe) cohortId: string,
  ) {
    return this.classSessionsService.findByCohort(tenantId, cohortId);
  }

  @Get('instructor/:instructorProfileId')
  @ApiOperation({ summary: 'List sessions by instructor' })
  findByInstructor(
    @TenantId() tenantId: string,
    @Param('instructorProfileId', ParseUUIDPipe) instructorProfileId: string,
  ) {
    return this.classSessionsService.findByInstructor(
      tenantId,
      instructorProfileId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class session by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classSessionsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a class session' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClassSessionDto,
  ) {
    return this.classSessionsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a class session' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.classSessionsService.remove(tenantId, id);
  }
}
