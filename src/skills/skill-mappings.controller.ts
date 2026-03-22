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
import { SkillMappingsService } from './skill-mappings.service.js';
import { CreateCourseSkillDto } from './dto/create-course-skill.dto.js';
import { CreateStudentSkillDto } from './dto/create-student-skill.dto.js';
import { UpdateStudentSkillDto } from './dto/update-student-skill.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Skill Mappings')
@Controller('skill-mappings')
export class SkillMappingsController {
  constructor(private readonly mappingsService: SkillMappingsService) {}

  /* ---- Course-Skill ---- */

  @Post('course')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Map a skill to a course' })
  @ApiResponse({ status: 201, description: 'Mapping created' })
  @ApiResponse({ status: 409, description: 'Duplicate mapping' })
  mapSkillToCourse(
    @TenantId() tenantId: string,
    @Body() dto: CreateCourseSkillDto,
  ) {
    return this.mappingsService.mapSkillToCourse(tenantId, dto);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'List skills mapped to a course' })
  findSkillsByCourse(
    @TenantId() tenantId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.mappingsService.findSkillsByCourse(tenantId, courseId);
  }

  @Get('skill/:skillId/courses')
  @ApiOperation({ summary: 'List courses that teach a skill' })
  findCoursesBySkill(
    @TenantId() tenantId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    return this.mappingsService.findCoursesBySkill(tenantId, skillId);
  }

  @Delete('course/:id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Remove a course-skill mapping' })
  removeCourseSkill(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.mappingsService.removeCourseSkill(tenantId, id);
  }

  /* ---- Student-Skill ---- */

  @Post('student')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Record a student skill proficiency' })
  @ApiResponse({ status: 201, description: 'Student skill recorded' })
  @ApiResponse({ status: 409, description: 'Duplicate record' })
  recordStudentSkill(
    @TenantId() tenantId: string,
    @Body() dto: CreateStudentSkillDto,
  ) {
    return this.mappingsService.recordStudentSkill(tenantId, dto);
  }

  @Get('student/:studentProfileId')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'List skills for a student' })
  findSkillsByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.mappingsService.findSkillsByStudent(tenantId, studentProfileId);
  }

  @Patch('student/:id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update a student skill record' })
  updateStudentSkill(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentSkillDto,
  ) {
    return this.mappingsService.updateStudentSkill(tenantId, id, dto);
  }
}
