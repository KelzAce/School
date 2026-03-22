import { Test, TestingModule } from '@nestjs/testing';
import { CompetencyAssessmentsController } from './competency-assessments.controller';
import { CompetencyAssessmentsService } from './competency-assessments.service';
import { CreateCompetencyAssessmentDto } from './dto/create-competency-assessment.dto';
import { ProficiencyLevel } from '../skills/entities/skill-enums';
import { AssessmentResult, AssessmentType } from './entities/competency-assessment.entity';

const tenantId = 'tenant-uuid-1';
const assessmentId = 'assess-uuid-1';
const studentProfileId = 'student-uuid-1';
const skillId = 'skill-uuid-1';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByStudent: jest.fn(),
  findByStudentAndSkill: jest.fn(),
};

describe('CompetencyAssessmentsController', () => {
  let controller: CompetencyAssessmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencyAssessmentsController],
      providers: [
        { provide: CompetencyAssessmentsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<CompetencyAssessmentsController>(
      CompetencyAssessmentsController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create', async () => {
      const dto: CreateCompetencyAssessmentDto = {
        studentProfileId,
        skillId,
        assessmentType: AssessmentType.PROJECT,
        score: 90,
        maxScore: 100,
        demonstratedLevel: ProficiencyLevel.ADVANCED,
      };
      const expected = { id: assessmentId, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(tenantId, dto);
      expect(mockService.create).toHaveBeenCalledWith(tenantId, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should delegate to service.findAll', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(tenantId, query);
      expect(mockService.findAll).toHaveBeenCalledWith(tenantId, query);
      expect(result).toEqual(expected);
    });
  });

  describe('findByStudent', () => {
    it('should delegate to service.findByStudent', async () => {
      const expected = [{ id: assessmentId }];
      mockService.findByStudent.mockResolvedValue(expected);

      const result = await controller.findByStudent(tenantId, studentProfileId);
      expect(mockService.findByStudent).toHaveBeenCalledWith(
        tenantId,
        studentProfileId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findByStudentAndSkill', () => {
    it('should delegate to service.findByStudentAndSkill', async () => {
      const expected = [{ id: assessmentId }];
      mockService.findByStudentAndSkill.mockResolvedValue(expected);

      const result = await controller.findByStudentAndSkill(
        tenantId,
        studentProfileId,
        skillId,
      );
      expect(mockService.findByStudentAndSkill).toHaveBeenCalledWith(
        tenantId,
        studentProfileId,
        skillId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to service.findOne', async () => {
      const expected = { id: assessmentId };
      mockService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(tenantId, assessmentId);
      expect(mockService.findOne).toHaveBeenCalledWith(tenantId, assessmentId);
      expect(result).toEqual(expected);
    });
  });
});
