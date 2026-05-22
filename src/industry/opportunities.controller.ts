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
import { ApiTags, ApiOperation, ApiResponse, ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service.js';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto/opportunity.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { OpportunityType, OpportunityStatus } from './entities/opportunity.entity.js';
import { IsEnum, IsOptional } from 'class-validator';

class OpportunityQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: OpportunityType })
  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;

  @ApiPropertyOptional({ enum: OpportunityStatus })
  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;
}

@ApiTags('Opportunities')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly service: OpportunitiesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create an opportunity' })
  @ApiResponse({ status: 201, description: 'Opportunity created' })
  create(@TenantId() tenantId: string, @Body() dto: CreateOpportunityDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List opportunities (paginated, filterable)' })
  findAll(@TenantId() tenantId: string, @Query() query: OpportunityQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('partner/:partnerId')
  @ApiOperation({ summary: 'Get opportunities by partner' })
  findByPartner(
    @TenantId() tenantId: string,
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
  ) {
    return this.service.findByPartner(tenantId, partnerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an opportunity' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove an opportunity' })
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(tenantId, id);
  }
}
