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
import { SkillsService } from './skills.service.js';
import { CreateSkillDto } from './dto/create-skill.dto.js';
import { UpdateSkillDto } from './dto/update-skill.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a skill' })
  @ApiResponse({ status: 201, description: 'Skill created' })
  @ApiResponse({ status: 409, description: 'Skill code already exists' })
  create(@TenantId() tenantId: string, @Body() dto: CreateSkillDto) {
    return this.skillsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List skills with optional category/type filter',
  })
  findAll(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: string,
  ) {
    return this.skillsService.findAll(tenantId, query, categoryId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a skill with children and course mappings' })
  @ApiResponse({ status: 404, description: 'Skill not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.skillsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a skill' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.skillsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a skill' })
  remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.skillsService.remove(tenantId, id);
  }
}
