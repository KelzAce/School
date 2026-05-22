import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CredentialValidationsService } from './credential-validations.service.js';
import {
  CreateCredentialValidationDto,
  UpdateValidationStatusDto,
} from './dto/credential-validation.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';

@ApiTags('Credential Validations')
@Controller('credential-validations')
export class CredentialValidationsController {
  constructor(private readonly service: CredentialValidationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a credential validation request' })
  @ApiResponse({ status: 201, description: 'Credential validation created' })
  @ApiResponse({ status: 409, description: 'Already validated by this partner' })
  create(@TenantId() tenantId: string, @Body() dto: CreateCredentialValidationDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all credential validations (paginated)' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('partner/:partnerId')
  @ApiOperation({ summary: 'Get credential validations by partner' })
  findByPartner(
    @TenantId() tenantId: string,
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
  ) {
    return this.service.findByPartner(tenantId, partnerId);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get credential validations by student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.service.findByStudent(tenantId, studentProfileId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credential validation by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update credential validation status' })
  updateStatus(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateValidationStatusDto,
  ) {
    return this.service.updateStatus(tenantId, id, dto);
  }
}
