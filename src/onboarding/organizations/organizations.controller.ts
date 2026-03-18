import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationsService,
  Organization,
  CreateOrganizationDto,
} from './organizations.service';

@Controller('onboarding/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(): Organization[] {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Organization {
    const organization = this.organizationsService.findOne(id);
    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" not found`);
    }
    return organization;
  }

  @Post()
  create(@Body() dto: CreateOrganizationDto): Organization {
    return this.organizationsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateOrganizationDto>,
  ): Organization {
    const organization = this.organizationsService.update(id, dto);
    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" not found`);
    }
    return organization;
  }
}
