import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PainPointsService, PainPoint } from './pain-points.service';

@Controller('pain-points')
export class PainPointsController {
  constructor(private readonly painPointsService: PainPointsService) {}

  @Get()
  findAll(): PainPoint[] {
    return this.painPointsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): PainPoint {
    const painPoint = this.painPointsService.findOne(id);
    if (!painPoint) {
      throw new NotFoundException(`Pain point with id "${id}" not found`);
    }
    return painPoint;
  }
}
