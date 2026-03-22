import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { CompetencyAssessmentsService } from './competency-assessments.service';
import {
  CompetencyAssessment,
  AssessmentType,
  AssessmentResult,
} from './entities/competency-assessment.entity';
import { MasteryRecord } from './entities/mastery-record.entity';
import { StudentSkill } from '../skills/entities/student-skill.entity';
import { ProficiencyLevel } from '../skills/entities/skill-enums';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
});

const tenantId = 'tenant-uuid-1';

const mockAssessment: Partial<CompetencyAssessment> = {
  id: 'assessment-uuid-1',
  tenantId,
  studentProfileId: 'student-uuid-1',
  skillId: 'skill-uuid-1',
  courseId: 'course-uuid-1',
  assessmentType: AssessmentType.PROJECT,
  score: 85,
  maxScore: 100,
  demonstratedLevel: ProficiencyLevel.INTERMEDIATE,
  result: AssessmentResult.ADVANCED,
  feedback: 'Great work',
  evidence: null,
  assessedBy: 'instructor-1',
  assessedAt: new Date(),
  tenant: null as any,
  studentProfile: null as any,
  skill: null as any,
  course: null as any,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CompetencyAssessmentsService', () => {
  let service: CompetencyAssessmentsService;
  let assessmentRepo: MockRepository<CompetencyAssessment>;
  let masteryRepo: MockRepository<MasteryRecord>;
  let studentSkillRepo: MockRepository<StudentSkill>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetencyAssessmentsService,
        {
          provide: getRepositoryToken(CompetencyAssessment),
          useValue: createMockRepository<CompetencyAssessment>(),
        },
        {
          provide: getRepositoryToken(MasteryRecord),
          useValue: createMockRepository<MasteryRecord>(),
        },
        {
          provide: getRepositoryToken(StudentSkill),
          useValue: createMockRepository<StudentSkill>(),
        },
      ],
    }).compile();

    service = module.get<CompetencyAssessmentsService>(
      CompetencyAssessmentsService,
    );
    assessmentRepo = module.get(getRepositoryToken(CompetencyAssessment));
    masteryRepo = module.get(getRepositoryToken(MasteryRecord));
    studentSkillRepo = module.get(getRepositoryToken(StudentSkill));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      studentProfileId: 'student-uuid-1',
      skillId: 'skill-uuid-1',
      courseId: 'course-uuid-1',
      assessmentType: AssessmentType.PROJECT,
      score: 85,
      maxScore: 100,
      demonstratedLevel: ProficiencyLevel.INTERMEDIATE,
      assessedBy: 'instructor-1',
    };

    it('should create an assessment with ADVANCED result (score >= 80%)', async () => {
      assessmentRepo.create!.mockReturnValue(mockAssessment);
      assessmentRepo.save!.mockResolvedValue(mockAssessment);
      masteryRepo.findOne!.mockResolvedValue(null);
      masteryRepo.create!.mockReturnValue({});
      masteryRepo.save!.mockResolvedValue({});
      studentSkillRepo.findOne!.mockResolvedValue(null);
      studentSkillRepo.create!.mockReturnValue({});
      studentSkillRepo.save!.mockResolvedValue({});

      const result = await service.create(tenantId, dto);
      expect(result).toEqual(mockAssessment);
      expect(assessmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ result: AssessmentResult.ADVANCED }),
      );
    });

    it('should create an assessment with COMPETENT result (60-79%)', async () => {
      const competentDto = { ...dto, score: 70 };
      const competentAssessment = {
        ...mockAssessment,
        score: 70,
        result: AssessmentResult.COMPETENT,
      };
      assessmentRepo.create!.mockReturnValue(competentAssessment);
      assessmentRepo.save!.mockResolvedValue(competentAssessment);
      masteryRepo.findOne!.mockResolvedValue(null);
      masteryRepo.create!.mockReturnValue({});
      masteryRepo.save!.mockResolvedValue({});
      studentSkillRepo.findOne!.mockResolvedValue(null);
      studentSkillRepo.create!.mockReturnValue({});
      studentSkillRepo.save!.mockResolvedValue({});

      await service.create(tenantId, competentDto);
      expect(assessmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ result: AssessmentResult.COMPETENT }),
      );
    });

    it('should create NOT_YET_COMPETENT when score < 60%', async () => {
      const failDto = { ...dto, score: 50 };
      const failAssessment = {
        ...mockAssessment,
        score: 50,
        result: AssessmentResult.NOT_YET_COMPETENT,
      };
      assessmentRepo.create!.mockReturnValue(failAssessment);
      assessmentRepo.save!.mockResolvedValue(failAssessment);

      await service.create(tenantId, failDto);
      expect(assessmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          result: AssessmentResult.NOT_YET_COMPETENT,
        }),
      );
      // Should NOT record mastery
      expect(masteryRepo.findOne).not.toHaveBeenCalled();
    });

    it('should create a new StudentSkill if none exists', async () => {
      assessmentRepo.create!.mockReturnValue(mockAssessment);
      assessmentRepo.save!.mockResolvedValue(mockAssessment);
      masteryRepo.findOne!.mockResolvedValue(null);
      masteryRepo.create!.mockReturnValue({});
      masteryRepo.save!.mockResolvedValue({});
      studentSkillRepo.findOne!.mockResolvedValue(null);
      studentSkillRepo.create!.mockReturnValue({});
      studentSkillRepo.save!.mockResolvedValue({});

      await service.create(tenantId, dto);
      expect(studentSkillRepo.create).toHaveBeenCalled();
      expect(studentSkillRepo.save).toHaveBeenCalled();
    });

    it('should upgrade StudentSkill level when demonstrated level is higher', async () => {
      const existingSkill = {
        currentLevel: ProficiencyLevel.BEGINNER,
        verifiedBy: null,
        verifiedAt: null,
      };
      assessmentRepo.create!.mockReturnValue(mockAssessment);
      assessmentRepo.save!.mockResolvedValue(mockAssessment);
      masteryRepo.findOne!.mockResolvedValue(null);
      masteryRepo.create!.mockReturnValue({});
      masteryRepo.save!.mockResolvedValue({});
      studentSkillRepo.findOne!.mockResolvedValue(existingSkill);
      studentSkillRepo.save!.mockResolvedValue({
        ...existingSkill,
        currentLevel: ProficiencyLevel.INTERMEDIATE,
      });

      await service.create(tenantId, dto);
      expect(studentSkillRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentLevel: ProficiencyLevel.INTERMEDIATE,
        }),
      );
    });

    it('should NOT downgrade StudentSkill level', async () => {
      const existingSkill = {
        currentLevel: ProficiencyLevel.ADVANCED,
        verifiedBy: 'prev',
        verifiedAt: new Date(),
      };
      const lowerDto = {
        ...dto,
        demonstratedLevel: ProficiencyLevel.BEGINNER,
      };
      assessmentRepo.create!.mockReturnValue({
        ...mockAssessment,
        demonstratedLevel: ProficiencyLevel.BEGINNER,
      });
      assessmentRepo.save!.mockResolvedValue({
        ...mockAssessment,
        demonstratedLevel: ProficiencyLevel.BEGINNER,
      });
      masteryRepo.findOne!.mockResolvedValue(null);
      masteryRepo.create!.mockReturnValue({});
      masteryRepo.save!.mockResolvedValue({});
      studentSkillRepo.findOne!.mockResolvedValue(existingSkill);

      await service.create(tenantId, lowerDto);
      // save should not be called on studentSkill since level is not higher
      expect(studentSkillRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated assessments', async () => {
      assessmentRepo.findAndCount!.mockResolvedValue([[mockAssessment], 1]);
      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toEqual([mockAssessment]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an assessment by id', async () => {
      assessmentRepo.findOne!.mockResolvedValue(mockAssessment);
      const result = await service.findOne(tenantId, 'assessment-uuid-1');
      expect(result).toEqual(mockAssessment);
    });

    it('should throw NotFoundException if not found', async () => {
      assessmentRepo.findOne!.mockResolvedValue(null);
      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStudent', () => {
    it('should return assessments for a student', async () => {
      assessmentRepo.find!.mockResolvedValue([mockAssessment]);
      const result = await service.findByStudent(tenantId, 'student-uuid-1');
      expect(result).toEqual([mockAssessment]);
    });
  });

  describe('findByStudentAndSkill', () => {
    it('should return assessment history for student + skill', async () => {
      assessmentRepo.find!.mockResolvedValue([mockAssessment]);
      const result = await service.findByStudentAndSkill(
        tenantId,
        'student-uuid-1',
        'skill-uuid-1',
      );
      expect(result).toEqual([mockAssessment]);
    });
  });
});
