import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BadgesService } from './badges.service.js';
import {
  CreateBadgeTemplateDto,
  UpdateBadgeTemplateDto,
} from './dto/badge-template.dto.js';
import { IssueBadgeDto, RevokeBadgeDto } from './dto/issued-badge.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';

@ApiTags('Badges')
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  /* ---------- Badge Templates ---------- */

  @Post('templates')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a badge template' })
  @ApiResponse({ status: 201, description: 'Badge template created' })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  createTemplate(
    @TenantId() tenantId: string,
    @Body() dto: CreateBadgeTemplateDto,
  ) {
    return this.badgesService.createTemplate(tenantId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List all badge templates' })
  findAllTemplates(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.badgesService.findAllTemplates(tenantId, query);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a badge template by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOneTemplate(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.badgesService.findOneTemplate(tenantId, id);
  }

  @Patch('templates/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a badge template' })
  updateTemplate(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBadgeTemplateDto,
  ) {
    return this.badgesService.updateTemplate(tenantId, id, dto);
  }

  @Delete('templates/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a badge template' })
  removeTemplate(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.badgesService.removeTemplate(tenantId, id);
  }

  /* ---------- Issued Badges ---------- */

  @Post('issue')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Issue a badge to a student' })
  @ApiResponse({ status: 201, description: 'Badge issued with verification hash' })
  @ApiResponse({ status: 409, description: 'Badge already issued to student' })
  issueBadge(@TenantId() tenantId: string, @Body() dto: IssueBadgeDto) {
    return this.badgesService.issueBadge(tenantId, dto);
  }

  @Get('issued')
  @ApiOperation({ summary: 'List all issued badges' })
  findAllIssued(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.badgesService.findAllIssued(tenantId, query);
  }

  @Get('issued/student/:studentProfileId')
  @ApiOperation({ summary: 'Get all active badges for a student' })
  findIssuedByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.badgesService.findIssuedByStudent(tenantId, studentProfileId);
  }

  @Get('issued/:id')
  @ApiOperation({ summary: 'Get an issued badge by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOneIssued(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.badgesService.findOneIssued(tenantId, id);
  }

  @Get('verify/:hash')
  @Public()
  @ApiOperation({ summary: 'Verify a badge by its verification hash (public)' })
  @ApiResponse({ status: 200, description: 'Badge details if valid' })
  verifyBadge(@Param('hash') hash: string) {
    return this.badgesService.verifyBadge(hash);
  }

  @Patch('issued/:id/revoke')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke an issued badge' })
  revokeBadge(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevokeBadgeDto,
  ) {
    return this.badgesService.revokeBadge(tenantId, id, dto);
  }
}
