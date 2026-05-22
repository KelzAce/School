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
import { IndustryPartnersService } from './industry-partners.service.js';
import { CreateIndustryPartnerDto, UpdateIndustryPartnerDto } from './dto/industry-partner.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';

@ApiTags('Industry Partners')
@Controller('industry-partners')
export class IndustryPartnersController {
  constructor(private readonly service: IndustryPartnersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create an industry partner' })
  @ApiResponse({ status: 201, description: 'Industry partner created' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  create(@TenantId() tenantId: string, @Body() dto: CreateIndustryPartnerDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all industry partners (paginated)' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get industry partner by slug (public)' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findBySlug(@TenantId() tenantId: string, @Param('slug') slug: string) {
    return this.service.findBySlug(tenantId, slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get industry partner by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an industry partner' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIndustryPartnerDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Patch(':id/verify')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify an industry partner' })
  verify(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.verify(tenantId, id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove an industry partner' })
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
