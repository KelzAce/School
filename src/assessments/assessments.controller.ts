import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  AssessmentsService,
  Assessment,
  CreateAssessmentDto,
  StudentProgress,
} from './assessments.service';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  findAll(@Query('studentId') studentId?: string): Assessment[] {
    if (studentId) {
      return this.assessmentsService.findByStudent(studentId);
    }
    return this.assessmentsService.findAll();
  }

  @Get('progress/:studentId')
  getProgress(@Param('studentId') studentId: string): StudentProgress {
    return this.assessmentsService.getStudentProgress(studentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Assessment {
    const assessment = this.assessmentsService.findOne(id);
    if (!assessment) {
      throw new NotFoundException(`Assessment with id "${id}" not found`);
    }
    return assessment;
  }

  @Post()
  create(@Body() dto: CreateAssessmentDto): Assessment {
    return this.assessmentsService.create(dto);
  }
}
