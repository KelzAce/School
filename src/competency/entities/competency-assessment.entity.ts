import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tenant } from '../../tenants/entities/tenant.entity.js';
import { StudentProfile } from '../../students/entities/student-profile.entity.js';
import { Course } from '../../courses/entities/course.entity.js';
import { Skill } from '../../skills/entities/skill.entity.js';
import { ProficiencyLevel } from '../../skills/entities/skill-enums.js';

export enum AssessmentType {
  PROJECT = 'project',
  PRACTICAL = 'practical',
  WRITTEN = 'written',
  PORTFOLIO = 'portfolio',
  PEER_REVIEW = 'peer_review',
  SELF_ASSESSMENT = 'self_assessment',
  INSTRUCTOR_OBSERVATION = 'instructor_observation',
}

export enum AssessmentResult {
  NOT_YET_COMPETENT = 'not_yet_competent',
  COMPETENT = 'competent',
  ADVANCED = 'advanced',
}

@Entity('competency_assessments')
@Index(['tenantId', 'studentProfileId', 'skillId'])
export class CompetencyAssessment extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  studentProfileId: string;

  @ManyToOne(() => StudentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentProfileId' })
  studentProfile: StudentProfile;

  @Column({ type: 'uuid' })
  skillId: string;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @Column({ type: 'uuid', nullable: true })
  courseId: string | null;

  @ManyToOne(() => Course, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;

  @Column({ type: 'enum', enum: AssessmentType })
  assessmentType: AssessmentType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({
    type: 'enum',
    enum: ProficiencyLevel,
  })
  demonstratedLevel: ProficiencyLevel;

  @Column({ type: 'enum', enum: AssessmentResult })
  result: AssessmentResult;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'text', nullable: true })
  evidence: string | null;

  @Column({ length: 255, nullable: true })
  assessedBy: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assessedAt: Date;
}
