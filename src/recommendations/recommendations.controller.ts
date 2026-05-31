import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecommendationsService, CourseRecommendation, SkillRecommendation } from './recommendations.service.js';
import { RecommendationQueryDto } from './dto/index.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { User, UserRole } from '../users/entities/user.entity.js';

@ApiTags('AI Recommendations')
@Controller('recommendations')
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('courses/:studentProfileId')
  @ApiOperation({ summary: 'Get personalized course recommendations for a student based on skill gaps and career pathway alignment' })
  getCourseRecommendations(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @Query() query: RecommendationQueryDto,
    @CurrentUser() requester: User,
  ): Promise<CourseRecommendation[]> {
    return this.recommendationsService.getCourseRecommendations(tenantId, studentProfileId, query, requester);
  }

  @Get('courses/:studentProfileId/pathway/:pathwayId')
  @ApiOperation({ summary: 'Get course recommendations to advance a specific career pathway' })
  getPathwayCourseRecommendations(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @Param('pathwayId', ParseUUIDPipe) pathwayId: string,
    @CurrentUser() requester: User,
  ): Promise<CourseRecommendation[]> {
    return this.recommendationsService.getPathwayCourseRecommendations(tenantId, studentProfileId, pathwayId, requester);
  }

  @Get('skills/:studentProfileId')
  @ApiOperation({ summary: 'Get prioritized skill recommendations for a student based on pathway gaps' })
  getSkillRecommendations(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @CurrentUser() requester: User,
  ): Promise<SkillRecommendation[]> {
    return this.recommendationsService.getSkillRecommendations(tenantId, studentProfileId, requester);
  }
}
