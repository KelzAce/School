import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioAssessmentsController } from './portfolio-assessments.controller.js';
import { PortfolioAssessmentsService } from './portfolio-assessments.service.js';
import {
  PortfolioAssessment,
  PortfolioAssessmentStatus,
} from './entities/portfolio-assessment.entity.js';

const mockAssessment = (): PortfolioAssessment =>
  ({
    id: 'assess-1',
    tenantId: 'tenant-1',
    portfolioId: 'portfolio-1',
    rubricId: 'rubric-1',
    status: PortfolioAssessmentStatus.IN_PROGRESS,
  } as PortfolioAssessment);

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPortfolio: jest.fn(),
  addCriterionScore: jest.fn(),
  complete: jest.fn(),
  getSummary: jest.fn(),
});

describe('PortfolioAssessmentsController', () => {
  let controller: PortfolioAssessmentsController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioAssessmentsController],
      providers: [
        {
          provide: PortfolioAssessmentsService,
          useFactory: mockService,
        },
      ],
    }).compile();

    controller = module.get<PortfolioAssessmentsController>(
      PortfolioAssessmentsController,
    );
    service = module.get(PortfolioAssessmentsService);
  });

  it('create calls service.create', async () => {
    const assessment = mockAssessment();
    service.create.mockResolvedValue(assessment);

    const result = await controller.create('tenant-1', {
      portfolioId: 'portfolio-1',
      rubricId: 'rubric-1',
    });
    expect(service.create).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({ portfolioId: 'portfolio-1' }),
    );
    expect(result).toEqual(assessment);
  });

  it('findAll calls service.findAll', async () => {
    const paginated = {
      data: [mockAssessment()],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };
    service.findAll.mockResolvedValue(paginated);

    const result = await controller.findAll('tenant-1', { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('tenant-1', { page: 1, limit: 20 });
    expect(result).toEqual(paginated);
  });

  it('getSummary calls service.getSummary', async () => {
    const summary = {
      studentProfileId: 'student-1',
      totalPortfolios: 2,
      submittedPortfolios: 1,
      reviewedPortfolios: 1,
      averageScorePercentage: 88.5,
      latestAssessments: [],
    };
    service.getSummary.mockResolvedValue(summary);

    const result = await controller.getSummary('tenant-1', 'student-1');
    expect(service.getSummary).toHaveBeenCalledWith('tenant-1', 'student-1');
    expect(result).toEqual(summary);
  });

  it('findByPortfolio calls service.findByPortfolio', async () => {
    const assessments = [mockAssessment()];
    service.findByPortfolio.mockResolvedValue(assessments);

    const result = await controller.findByPortfolio('tenant-1', 'portfolio-1');
    expect(service.findByPortfolio).toHaveBeenCalledWith(
      'tenant-1',
      'portfolio-1',
    );
    expect(result).toEqual(assessments);
  });

  it('findOne calls service.findOne', async () => {
    const assessment = mockAssessment();
    service.findOne.mockResolvedValue(assessment);

    const result = await controller.findOne('tenant-1', 'assess-1');
    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'assess-1');
    expect(result).toEqual(assessment);
  });

  it('addCriterionScore calls service.addCriterionScore', async () => {
    const score = {
      id: 'score-1',
      assessmentId: 'assess-1',
      criterionId: 'crit-1',
      score: 9,
    };
    service.addCriterionScore.mockResolvedValue(score);

    const result = await controller.addCriterionScore('tenant-1', 'assess-1', {
      criterionId: 'crit-1',
      score: 9,
    });
    expect(service.addCriterionScore).toHaveBeenCalledWith(
      'tenant-1',
      'assess-1',
      expect.objectContaining({ criterionId: 'crit-1', score: 9 }),
    );
    expect(result).toEqual(score);
  });

  it('complete calls service.complete', async () => {
    const completed = {
      ...mockAssessment(),
      status: PortfolioAssessmentStatus.COMPLETED,
    };
    service.complete.mockResolvedValue(completed);

    const result = await controller.complete('tenant-1', 'assess-1', {
      overallFeedback: 'Great work',
    });
    expect(service.complete).toHaveBeenCalledWith(
      'tenant-1',
      'assess-1',
      expect.objectContaining({ overallFeedback: 'Great work' }),
    );
    expect(result.status).toBe(PortfolioAssessmentStatus.COMPLETED);
  });
});
