import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { CareerPathwaysService } from './career-pathways.service.js';
import { CreateCareerPathwayDto } from './dto/create-career-pathway.dto.js';
import { UpdateCareerPathwayDto } from './dto/update-career-pathway.dto.js';
import { AddPathwaySkillDto } from './dto/add-pathway-skill.dto.js';

@ApiTags('Career Pathway Mapping')
@Controller('career-pathways')
export class CareerPathwaysController {
  constructor(private readonly careerPathwaysService: CareerPathwaysService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a career pathway' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  create(@TenantId() tenantId: string, @Body() dto: CreateCareerPathwayDto) {
    return this.careerPathwaysService.create(tenantId, dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.INDUSTRY_PARTNER)
  @ApiOperation({ summary: 'List all career pathways' })
  @ApiQuery({ name: 'sector', required: false })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  findAll(
    @TenantId() tenantId: string,
    @Query('sector') sector?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    const options: { sector?: string; isPublished?: boolean } = {};
    if (sector) options.sector = sector;
    if (isPublished !== undefined) options.isPublished = isPublished === 'true';
    return this.careerPathwaysService.findAll(tenantId, options);
  }

  @Get('student/:studentProfileId/suggestions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get suggested career pathways for a student based on current skills' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  getStudentSuggestions(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @CurrentUser() requester: User,
  ) {
    return this.careerPathwaysService.getStudentSuggestions(tenantId, studentProfileId, requester);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.INDUSTRY_PARTNER)
  @ApiOperation({ summary: 'Get a single career pathway with its skills' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.careerPathwaysService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a career pathway' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCareerPathwayDto,
  ) {
    return this.careerPathwaysService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a career pathway' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.careerPathwaysService.remove(tenantId, id);
  }

  @Post(':id/skills')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a skill requirement to a career pathway' })
  @ApiResponse({ status: 404, description: 'Pathway or skill not found' })
  @ApiResponse({ status: 409, description: 'Skill already in pathway' })
  addSkill(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) pathwayId: string,
    @Body() dto: AddPathwaySkillDto,
  ) {
    return this.careerPathwaysService.addSkill(tenantId, pathwayId, dto);
  }

  @Delete(':id/skills/:skillId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a skill requirement from a career pathway' })
  @ApiResponse({ status: 404, description: 'Skill mapping not found' })
  removeSkill(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) pathwayId: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
  ) {
    return this.careerPathwaysService.removeSkill(tenantId, pathwayId, skillId);
  }

  @Get(':id/skill-tree')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.INDUSTRY_PARTNER)
  @ApiOperation({ summary: 'Get the hierarchical skill tree for a career pathway' })
  @ApiResponse({ status: 404, description: 'Pathway not found' })
  getSkillTree(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) pathwayId: string,
  ) {
    return this.careerPathwaysService.getSkillTree(tenantId, pathwayId);
  }

  @Get(':id/student/:studentProfileId/progress')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  @ApiOperation({ summary: "Get a student's progress on a specific career pathway" })
  @ApiResponse({ status: 404, description: 'Pathway or student not found' })
  getStudentProgress(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) pathwayId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
    @CurrentUser() requester: User,
  ) {
    return this.careerPathwaysService.getStudentProgress(
      tenantId,
      studentProfileId,
      pathwayId,
      requester,
    );
  }
}
