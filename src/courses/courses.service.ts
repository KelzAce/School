import { Injectable } from '@nestjs/common';
import { LearningTrack } from '../students/entities/student-profile.entity';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CourseModule {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  track: LearningTrack;
  difficulty: Difficulty;
  isAsynchronous: boolean;
  modules: CourseModule[];
}

export interface CreateCourseDto {
  title: string;
  description: string;
  track: LearningTrack;
  difficulty: Difficulty;
  isAsynchronous: boolean;
}

@Injectable()
export class CoursesService {
  private readonly courses: Course[] = [
    {
      id: 'co-001',
      title: 'Introduction to Python',
      description:
        'A self-paced beginner course covering programming fundamentals with Python. Students advance upon demonstrating mastery of each module.',
      track: 'STEM',
      difficulty: 'beginner',
      isAsynchronous: true,
      modules: [
        {
          id: 'co-001-m1',
          title: 'Variables & Data Types',
          content:
            'Understand how to declare variables, assign values, and work with primitive data types.',
          order: 1,
        },
        {
          id: 'co-001-m2',
          title: 'Control Flow',
          content:
            'Write conditional statements and loops to control program execution.',
          order: 2,
        },
        {
          id: 'co-001-m3',
          title: 'Functions & Modules',
          content:
            'Define reusable functions and organise code into modules.',
          order: 3,
        },
      ],
    },
    {
      id: 'co-002',
      title: 'Entrepreneurship Fundamentals',
      description:
        'An elective track course guiding students through ideation, market research, and building a minimum viable product.',
      track: 'Entrepreneurship',
      difficulty: 'intermediate',
      isAsynchronous: true,
      modules: [
        {
          id: 'co-002-m1',
          title: 'Identifying Opportunities',
          content:
            'Techniques for spotting real-world problems and evaluating their market potential.',
          order: 1,
        },
        {
          id: 'co-002-m2',
          title: 'Lean Startup Principles',
          content:
            'Apply build-measure-learn cycles to validate assumptions quickly.',
          order: 2,
        },
      ],
    },
    {
      id: 'co-003',
      title: 'Visual Arts & Design Thinking',
      description:
        'Blends traditional visual arts techniques with human-centred design thinking methodology.',
      track: 'Arts',
      difficulty: 'beginner',
      isAsynchronous: false,
      modules: [
        {
          id: 'co-003-m1',
          title: 'Principles of Design',
          content:
            'Explore balance, contrast, hierarchy, and colour theory through hands-on projects.',
          order: 1,
        },
        {
          id: 'co-003-m2',
          title: 'Design Thinking Process',
          content:
            'Empathise, define, ideate, prototype, and test solutions to real community challenges.',
          order: 2,
        },
      ],
    },
  ];

  private nextIdCounter = 4;

  findAll(): Course[] {
    return this.courses;
  }

  findOne(id: string): Course | undefined {
    return this.courses.find((c) => c.id === id);
  }

  findByTrack(track: LearningTrack): Course[] {
    return this.courses.filter((c) => c.track === track);
  }

  create(dto: CreateCourseDto): Course {
    const course: Course = {
      id: `co-${String(this.nextIdCounter++).padStart(3, '0')}`,
      ...dto,
      modules: [],
    };
    this.courses.push(course);
    return course;
  }
}
