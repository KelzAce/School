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
import { CourseAssignmentsService } from './course-assignments.service.js';
import { CreateCourseAssignmentDto } from './dto/create-course-assignment.dto.js';
import { UpdateCourseAssignmentStatusDto } from './dto/update-course-assignment-status.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Course Assignments')
@Controller('course-assignments')
export class CourseAssignmentsController {
  constructor(
    private readonly assignmentsService: CourseAssignmentsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign an instructor to a course' })
  @ApiResponse({ status: 201, description: 'Assignment created' })
  @ApiResponse({ status: 409, description: 'Duplicate assignment' })
  @ApiResponse({ status: 400, description: 'Course load exceeded' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateCourseAssignmentDto,
  ) {
    return this.assignmentsService.create(tenantId, dto);
  }

  @Get('instructor/:instructorProfileId')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'List assignments for an instructor' })
  findByInstructor(
    @TenantId() tenantId: string,
    @Param('instructorProfileId', ParseUUIDPipe) instructorProfileId: string,
  ) {
    return this.assignmentsService.findByInstructor(
      tenantId,
      instructorProfileId,
    );
  }

  @Get('course/:courseId')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'List instructors assigned to a course' })
  findByCourse(
    @TenantId() tenantId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.assignmentsService.findByCourse(tenantId, courseId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update assignment status' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseAssignmentStatusDto,
  ) {
    return this.assignmentsService.updateStatus(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a course assignment' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assignmentsService.remove(tenantId, id);
  }
}
