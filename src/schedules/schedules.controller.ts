import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  SchedulesService,
  ScheduleSlot,
  CreateScheduleSlotDto,
  ScheduleStatus,
} from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll(@Query('studentId') studentId?: string): ScheduleSlot[] {
    if (studentId) {
      return this.schedulesService.findByStudent(studentId);
    }
    return this.schedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): ScheduleSlot {
    const slot = this.schedulesService.findOne(id);
    if (!slot) {
      throw new NotFoundException(`Schedule slot with id "${id}" not found`);
    }
    return slot;
  }

  @Post()
  create(@Body() dto: CreateScheduleSlotDto): ScheduleSlot {
    return this.schedulesService.create(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ScheduleStatus,
  ): ScheduleSlot {
    const slot = this.schedulesService.updateStatus(id, status);
    if (!slot) {
      throw new NotFoundException(`Schedule slot with id "${id}" not found`);
    }
    return slot;
  }
}
