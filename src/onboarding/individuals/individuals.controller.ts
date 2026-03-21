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
  IndividualsService,
  Individual,
  CreateIndividualDto,
} from './individuals.service';

@Controller('onboarding/individuals')
export class IndividualsController {
  constructor(private readonly individualsService: IndividualsService) {}

  @Get()
  findAll(): Individual[] {
    return this.individualsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Individual {
    const individual = this.individualsService.findOne(id);
    if (!individual) {
      throw new NotFoundException(`Individual with id "${id}" not found`);
    }
    return individual;
  }

  @Post()
  create(@Body() dto: CreateIndividualDto): Individual {
    return this.individualsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateIndividualDto>,
  ): Individual {
    const individual = this.individualsService.update(id, dto);
    if (!individual) {
      throw new NotFoundException(`Individual with id "${id}" not found`);
    }
    return individual;
  }
}
