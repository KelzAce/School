import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CohortEnrollmentsService } from './cohort-enrollments.service.js';
import {
  CreateCohortEnrollmentDto,
  UpdateCohortEnrollmentDto,
} from './dto/cohort-enrollment.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Cohort Enrollments')
@Controller('cohort-enrollments')
export class CohortEnrollmentsController {
  constructor(
    private readonly cohortEnrollmentsService: CohortEnrollmentsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Enroll a student in a cohort' })
  @ApiResponse({ status: 201, description: 'Enrollment created' })
  @ApiResponse({ status: 409, description: 'Already enrolled' })
  @ApiResponse({ status: 400, description: 'Cohort full or not accepting' })
  enroll(
    @TenantId() tenantId: string,
    @Body() dto: CreateCohortEnrollmentDto,
  ) {
    return this.cohortEnrollmentsService.enroll(tenantId, dto);
  }

  @Get('cohort/:cohortId')
  @ApiOperation({ summary: 'List enrollments by cohort' })
  findByCohort(
    @TenantId() tenantId: string,
    @Param('cohortId', ParseUUIDPipe) cohortId: string,
  ) {
    return this.cohortEnrollmentsService.findByCohort(tenantId, cohortId);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'List enrollments by student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.cohortEnrollmentsService.findByStudent(
      tenantId,
      studentProfileId,
    );
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update cohort enrollment status' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCohortEnrollmentDto,
  ) {
    return this.cohortEnrollmentsService.updateStatus(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a cohort enrollment' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.cohortEnrollmentsService.remove(tenantId, id);
  }
}
