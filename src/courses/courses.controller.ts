import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  @ApiResponse({ status: 409, description: 'Course code already exists' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List courses with optional track filter and pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
    @Query('track') track?: string,
  ) {
    return this.coursesService.findAll(tenantId, query, track);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coursesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 409, description: 'Course code conflict' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coursesService.remove(tenantId, id);
  }
}
