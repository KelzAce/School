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
  SchoolsService,
  School,
  CreateSchoolDto,
} from './schools.service';

@Controller('onboarding/schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  findAll(): School[] {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): School {
    const school = this.schoolsService.findOne(id);
    if (!school) {
      throw new NotFoundException(`School with id "${id}" not found`);
    }
    return school;
  }

  @Post()
  create(@Body() dto: CreateSchoolDto): School {
    return this.schoolsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSchoolDto>,
  ): School {
    const school = this.schoolsService.update(id, dto);
    if (!school) {
      throw new NotFoundException(`School with id "${id}" not found`);
    }
    return school;
  }
}
