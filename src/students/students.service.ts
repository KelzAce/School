import { Injectable } from '@nestjs/common';

export type LearningTrack =
  | 'STEM'
  | 'Arts'
  | 'Entrepreneurship'
  | 'Trades'
  | 'General';

export interface Student {
  id: string;
  name: string;
  email: string;
  gradeLevel: string;
  learningTrack: LearningTrack;
  enrolledAt: string;
}

export interface CreateStudentDto {
  name: string;
  email: string;
  gradeLevel: string;
  learningTrack: LearningTrack;
}

@Injectable()
export class StudentsService {
  private readonly students: Student[] = [
    {
      id: 'st-001',
      name: 'Alice Johnson',
      email: 'alice.johnson@school.example',
      gradeLevel: 'Grade 9',
      learningTrack: 'STEM',
      enrolledAt: '2024-09-01T08:00:00Z',
    },
    {
      id: 'st-002',
      name: 'Marcus Williams',
      email: 'marcus.williams@school.example',
      gradeLevel: 'Grade 10',
      learningTrack: 'Arts',
      enrolledAt: '2024-09-01T08:00:00Z',
    },
    {
      id: 'st-003',
      name: 'Priya Patel',
      email: 'priya.patel@school.example',
      gradeLevel: 'Grade 11',
      learningTrack: 'Entrepreneurship',
      enrolledAt: '2024-09-01T08:00:00Z',
    },
  ];

  private nextIdCounter = 4;

  findAll(): Student[] {
    return this.students;
  }

  findOne(id: string): Student | undefined {
    return this.students.find((s) => s.id === id);
  }

  create(dto: CreateStudentDto): Student {
    const student: Student = {
      id: `st-${String(this.nextIdCounter++).padStart(3, '0')}`,
      ...dto,
      enrolledAt: new Date().toISOString(),
    };
    this.students.push(student);
    return student;
  }

  update(id: string, dto: Partial<CreateStudentDto>): Student | undefined {
    const student = this.findOne(id);
    if (!student) return undefined;
    Object.assign(student, dto);
    return student;
  }
}
