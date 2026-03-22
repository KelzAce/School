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
import { StudentsService } from './students.service.js';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a student profile' })
  @ApiResponse({ status: 201, description: 'Student profile created' })
  @ApiResponse({ status: 409, description: 'Student number already exists' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateStudentProfileDto,
  ) {
    return this.studentsService.create(tenantId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'List student profiles with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.studentsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get a student profile by ID' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a student profile' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'Student number conflict' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.studentsService.update(tenantId, id, dto);
  }
}
