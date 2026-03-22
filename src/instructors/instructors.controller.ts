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
import { InstructorsService } from './instructors.service.js';
import { CreateInstructorProfileDto } from './dto/create-instructor-profile.dto.js';
import { UpdateInstructorProfileDto } from './dto/update-instructor-profile.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create an instructor profile' })
  @ApiResponse({ status: 201, description: 'Instructor profile created' })
  @ApiResponse({ status: 409, description: 'Employee number already exists' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateInstructorProfileDto,
  ) {
    return this.instructorsService.create(tenantId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'List instructor profiles with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.instructorsService.findAll(tenantId, query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get an instructor profile by ID' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.instructorsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an instructor profile' })
  @ApiResponse({ status: 404, description: 'Instructor not found' })
  @ApiResponse({ status: 409, description: 'Employee number conflict' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInstructorProfileDto,
  ) {
    return this.instructorsService.update(tenantId, id, dto);
  }
}
