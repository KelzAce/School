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
import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STUDENT)
  @ApiOperation({ summary: 'Create a new enrollment application' })
  @ApiResponse({ status: 201, description: 'Enrollment created' })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.enrollmentsService.create(tenantId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'List all enrollments with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.enrollmentsService.findAll(tenantId, query);
  }

  @Get('student/:studentProfileId')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'List enrollments for a specific student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.enrollmentsService.findByStudent(tenantId, studentProfileId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.enrollmentsService.findOne(tenantId, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update enrollment status (approve, reject, activate, complete, withdraw)' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentsService.updateStatus(tenantId, id, dto);
  }
}
