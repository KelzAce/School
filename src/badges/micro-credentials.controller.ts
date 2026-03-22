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
import { MicroCredentialsService } from './micro-credentials.service.js';
import {
  IssueMicroCredentialDto,
  RevokeMicroCredentialDto,
} from './dto/micro-credential.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { TenantId } from '../tenants/decorators/tenant-id.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';

@ApiTags('Micro-Credentials')
@Controller('micro-credentials')
export class MicroCredentialsController {
  constructor(
    private readonly credentialsService: MicroCredentialsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Issue a micro-credential to a student' })
  @ApiResponse({ status: 201, description: 'Micro-credential issued' })
  @ApiResponse({ status: 409, description: 'Duplicate code' })
  issue(@TenantId() tenantId: string, @Body() dto: IssueMicroCredentialDto) {
    return this.credentialsService.issue(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all micro-credentials' })
  findAll(@TenantId() tenantId: string, @Query() query: PaginationQueryDto) {
    return this.credentialsService.findAll(tenantId, query);
  }

  @Get('student/:studentProfileId')
  @ApiOperation({ summary: 'Get all active micro-credentials for a student' })
  findByStudent(
    @TenantId() tenantId: string,
    @Param('studentProfileId', ParseUUIDPipe) studentProfileId: string,
  ) {
    return this.credentialsService.findByStudent(tenantId, studentProfileId);
  }

  @Get('verify/:hash')
  @Public()
  @ApiOperation({ summary: 'Verify a micro-credential by hash (public)' })
  verify(@Param('hash') hash: string) {
    return this.credentialsService.verify(hash);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a micro-credential by ID' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.credentialsService.findOne(tenantId, id);
  }

  @Patch(':id/revoke')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke a micro-credential' })
  revoke(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevokeMicroCredentialDto,
  ) {
    return this.credentialsService.revoke(tenantId, id, dto);
  }
}
