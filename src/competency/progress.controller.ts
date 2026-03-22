import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Competency Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get overall progress summary for a student' })
  getStudentProgress(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.progressService.getStudentProgress(tenantId, studentProfileId);
  }

  @Get('student/:studentProfileId/course/:courseId')
  @ApiOperation({ summary: 'Get student progress for a specific course' })
  getCourseProgress(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.progressService.getCourseProgress(
      tenantId,
      courseId,
      studentProfileId,
    );
  }

  @Get('student/:studentProfileId/timeline')
  @ApiOperation({ summary: 'Get mastery achievement timeline for a student' })
  getMasteryTimeline(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.progressService.getMasteryTimeline(tenantId, studentProfileId);
  }
}
