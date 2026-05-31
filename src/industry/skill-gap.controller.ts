import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { SkillGapService } from './skill-gap.service.js';
import { AnalyzeCustomSkillGapDto } from './dto/skill-gap.dto.js';

@ApiTags('Skill Gap Analysis')
@Controller('skill-gap')
export class SkillGapController {
  constructor(private readonly skillGapService: SkillGapService) {}

  @Get('student/:studentProfileId/opportunity/:opportunityId')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Analyze a student\'s skill gap for an opportunity' })
  @ApiResponse({ status: 404, description: 'Student or opportunity not found' })
  getStudentOpportunityGap(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @Param('opportunityId', ParseUUIDPipe) opportunityId: string,
    @CurrentUser() requester: User,
  ) {
    return this.skillGapService.getStudentOpportunityGap(
      tenantId,
      studentProfileId,
      opportunityId,
      requester,
    );
  }

  @Post('student/:studentProfileId/custom-target')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Analyze a student\'s skill gap for a custom target' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  analyzeCustomTarget(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @Body() dto: AnalyzeCustomSkillGapDto,
    @CurrentUser() requester: User,
  ) {
    return this.skillGapService.analyzeCustomTarget(
      tenantId,
      studentProfileId,
      dto,
      requester,
    );
  }

  @Get('student/:studentProfileId/summary')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get cross-opportunity skill gap summary for a student' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  getStudentGapSummary(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @CurrentUser() requester: User,
  ) {
    return this.skillGapService.getStudentGapSummary(
      tenantId,
      studentProfileId,
      requester,
    );
  }
}
