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
  StudentsService,
  Student,
  CreateStudentDto,
} from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(): Student[] {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Student {
    const student = this.studentsService.findOne(id);
    if (!student) {
      throw new NotFoundException(`Student with id "${id}" not found`);
    }
    return student;
  }

  @Post()
  create(@Body() dto: CreateStudentDto): Student {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateStudentDto>,
  ): Student {
    const student = this.studentsService.update(id, dto);
    if (!student) {
      throw new NotFoundException(`Student with id "${id}" not found`);
    }
    return student;
  }
}
