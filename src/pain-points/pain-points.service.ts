import { Injectable } from '@nestjs/common';

export interface NextAction {
  id: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PainPoint {
  id: string;
  title: string;
  description: string;
  category: string;
  nextActions: NextAction[];
}

@Injectable()
export class PainPointsService {
  private readonly painPoints: PainPoint[] = [
    {
      id: 'pp-001',
      title: 'Rigid Timetables',
      description:
        'Every student follows the same schedule regardless of learning pace or style, leaving no room for individual flexibility.',
      category: 'Scheduling',
      nextActions: [
        {
          id: 'na-001-1',
          action:
            'Implement a flexible scheduling service that generates personalised daily plans based on student availability and learning preferences.',
          priority: 'high',
        },
        {
          id: 'na-001-2',
          action:
            'Introduce asynchronous content delivery so students can access lessons at any time, replacing mandatory bell schedules.',
          priority: 'high',
        },
        {
          id: 'na-001-3',
          action:
            'Build a booking system for on-demand live sessions (virtual or in-person) for collaborative work and labs.',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'pp-002',
      title: 'Standardised Curriculum',
      description:
        'One-size-fits-all content leaves advanced learners bored and struggling learners behind, failing to cater to diverse learning needs.',
      category: 'Curriculum',
      nextActions: [
        {
          id: 'na-002-1',
          action:
            "Develop an AI-powered adaptive learning engine that adjusts difficulty and topic sequencing based on each student's demonstrated progress.",
          priority: 'high',
        },
        {
          id: 'na-002-2',
          action:
            'Create elective track offerings (STEM, Arts, Entrepreneurship, Trades) so students can personalise their learning journey alongside core subjects.',
          priority: 'high',
        },
        {
          id: 'na-002-3',
          action:
            'Enable self-paced modules where learners advance upon demonstrating mastery rather than following a fixed calendar.',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'pp-003',
      title: 'Physical Dependency',
      description:
        'Learning is tied to a physical building, limiting access for remote, differently-abled, or otherwise constrained students.',
      category: 'Accessibility',
      nextActions: [
        {
          id: 'na-003-1',
          action:
            'Build a fully responsive web and mobile application with offline support for students in low-bandwidth or remote environments.',
          priority: 'high',
        },
        {
          id: 'na-003-2',
          action:
            'Implement accessibility-first design including screen reader support, adjustable text sizes, and colour contrast modes.',
          priority: 'high',
        },
        {
          id: 'na-003-3',
          action:
            'Add a multi-language interface with auto-generated translated content to support diverse student populations.',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'pp-004',
      title: 'Infrequent Feedback',
      description:
        'Progress is measured through periodic high-stakes exams rather than continuous assessment, hiding learning gaps until it is too late.',
      category: 'Assessment',
      nextActions: [
        {
          id: 'na-004-1',
          action:
            'Introduce formative micro-assessments throughout each module to replace reliance on terminal examinations.',
          priority: 'high',
        },
        {
          id: 'na-004-2',
          action:
            'Build real-time progress dashboards for students, teachers, and parents with visualised skill development over time.',
          priority: 'high',
        },
        {
          id: 'na-004-3',
          action:
            'Create an automated early-warning system that flags students at risk of falling behind and triggers coach interventions.',
          priority: 'high',
        },
        {
          id: 'na-004-4',
          action:
            'Launch a skill-based portfolio system so students build a verified record of demonstrated competencies rather than relying solely on grades.',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'pp-005',
      title: 'Siloed Communication',
      description:
        'Teachers, parents, and administrators rarely collaborate in real time, leading to fragmented support for students.',
      category: 'Communication',
      nextActions: [
        {
          id: 'na-005-1',
          action:
            'Build a unified communication hub with direct in-app messaging between students, teachers, coaches, and parents.',
          priority: 'high',
        },
        {
          id: 'na-005-2',
          action:
            'Deliver weekly AI-generated progress summaries to parents via email or SMS to keep them continuously informed.',
          priority: 'medium',
        },
        {
          id: 'na-005-3',
          action:
            'Create shared visibility dashboards so all stakeholders (student, parent, coach, admin) see the same progress data in real time.',
          priority: 'medium',
        },
      ],
    },
    {
      id: 'pp-006',
      title: 'Credential-Focused Culture',
      description:
        'Success is measured by grades and certificates rather than demonstrated skills, misaligning incentives with real-world competency.',
      category: 'Culture & Assessment',
      nextActions: [
        {
          id: 'na-006-1',
          action:
            'Shift assessment to a competency-based model where students earn verified digital badges and credentials for demonstrated skills.',
          priority: 'high',
        },
        {
          id: 'na-006-2',
          action:
            'Introduce project-based learning sprints that mirror real-world team collaboration and produce tangible portfolio artefacts.',
          priority: 'high',
        },
        {
          id: 'na-006-3',
          action:
            'Establish a peer-to-peer tutoring marketplace where advanced students earn credits by supporting peers, reinforcing mastery through teaching.',
          priority: 'medium',
        },
      ],
    },
  ];

  findAll(): PainPoint[] {
    return this.painPoints;
  }

  findOne(id: string): PainPoint | undefined {
    return this.painPoints.find((p) => p.id === id);
  }
}
