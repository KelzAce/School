import { Injectable } from '@nestjs/common';

export type AssessmentType = 'micro' | 'portfolio' | 'project';

export interface Assessment {
  id: string;
  studentId: string;
  courseId: string;
  type: AssessmentType;
  score: number;
  maxScore: number;
  completedAt: string;
  feedback: string;
  skills: string[];
}

export interface CreateAssessmentDto {
  studentId: string;
  courseId: string;
  type: AssessmentType;
  score: number;
  maxScore: number;
  feedback: string;
  skills: string[];
}

export interface StudentProgress {
  studentId: string;
  totalAssessments: number;
  averageScore: number;
  masteredSkills: string[];
  atRisk: boolean;
}

@Injectable()
export class AssessmentsService {
  private readonly assessments: Assessment[] = [
    {
      id: 'as-001',
      studentId: 'st-001',
      courseId: 'co-001',
      type: 'micro',
      score: 9,
      maxScore: 10,
      completedAt: '2025-01-15T10:30:00Z',
      feedback:
        'Excellent grasp of variable scoping. Review list mutability edge cases.',
      skills: ['variables', 'data-types'],
    },
    {
      id: 'as-002',
      studentId: 'st-001',
      courseId: 'co-001',
      type: 'micro',
      score: 7,
      maxScore: 10,
      completedAt: '2025-01-18T11:00:00Z',
      feedback: 'Good loop usage. Practice nested conditionals for mastery.',
      skills: ['control-flow', 'loops'],
    },
    {
      id: 'as-003',
      studentId: 'st-002',
      courseId: 'co-003',
      type: 'project',
      score: 42,
      maxScore: 50,
      completedAt: '2025-01-19T15:00:00Z',
      feedback:
        'Creative poster design. Strengthen use of contrast for accessibility.',
      skills: ['design-principles', 'colour-theory'],
    },
    {
      id: 'as-004',
      studentId: 'st-003',
      courseId: 'co-002',
      type: 'portfolio',
      score: 18,
      maxScore: 20,
      completedAt: '2025-01-20T09:00:00Z',
      feedback:
        'Strong market research section. Prototype could include more user testing evidence.',
      skills: ['market-research', 'lean-startup'],
    },
  ];

  private nextIdCounter = 5;

  findAll(): Assessment[] {
    return this.assessments;
  }

  findOne(id: string): Assessment | undefined {
    return this.assessments.find((a) => a.id === id);
  }

  findByStudent(studentId: string): Assessment[] {
    return this.assessments.filter((a) => a.studentId === studentId);
  }

  getStudentProgress(studentId: string): StudentProgress {
    const studentAssessments = this.findByStudent(studentId);
    const totalAssessments = studentAssessments.length;

    const averageScore =
      totalAssessments === 0
        ? 0
        : studentAssessments.reduce(
            (sum, a) => sum + a.score / a.maxScore,
            0,
          ) / totalAssessments;

    const masteredSkills = [
      ...new Set(
        studentAssessments
          .filter((a) => a.score / a.maxScore >= 0.8)
          .flatMap((a) => a.skills),
      ),
    ];

    const atRisk = totalAssessments > 0 && averageScore < 0.6;

    return { studentId, totalAssessments, averageScore, masteredSkills, atRisk };
  }

  create(dto: CreateAssessmentDto): Assessment {
    const assessment: Assessment = {
      id: `as-${String(this.nextIdCounter++).padStart(3, '0')}`,
      ...dto,
      completedAt: new Date().toISOString(),
    };
    this.assessments.push(assessment);
    return assessment;
  }
}
