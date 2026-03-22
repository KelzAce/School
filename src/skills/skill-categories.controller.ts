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
import { SkillCategoriesService } from './skill-categories.service.js';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto.js';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Skill Categories')
@Controller('skill-categories')
export class SkillCategoriesController {
  constructor(
    private readonly categoriesService: SkillCategoriesService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a skill category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 409, description: 'Code already exists' })
  create(
    @TenantId() tenantId: string,
    @Body() dto: CreateSkillCategoryDto,
  ) {
    return this.categoriesService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List skill categories' })
  findAll(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.categoriesService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a skill category with its skills' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a skill category' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillCategoryDto,
  ) {
    return this.categoriesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a skill category' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.remove(tenantId, id);
  }
}
