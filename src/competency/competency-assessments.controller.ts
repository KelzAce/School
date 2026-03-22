import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompetencyAssessmentsService } from './competency-assessments.service.js';
import { CreateCompetencyAssessmentDto } from './dto/create-competency-assessment.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Competency Assessments')
@Controller('competency-assessments')
export class CompetencyAssessmentsController {
  constructor(
    private readonly assessmentsService: CompetencyAssessmentsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Record a competency assessment' })
  @ApiResponse({ status: 201, description: 'Assessment recorded, mastery auto-evaluated' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateCompetencyAssessmentDto,
  ) {
    return this.assessmentsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all competency assessments' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.assessmentsService.findAll(tenantId, query);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'List assessments by student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.assessmentsService.findByStudent(tenantId, studentProfileId);
  }

  @Get('student/:studentProfileId/skill/:skillId')
  @ApiOperation({ summary: 'Assessment history for a student on a specific skill' })
  findByStudentAndSkill(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    return this.assessmentsService.findByStudentAndSkill(
      tenantId,
      studentProfileId,
      skillId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a competency assessment by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assessmentsService.findOne(tenantId, id);
  }
}
