import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  PortfolioAssessmentsService,
} from './portfolio-assessments.service.js';
import {
  PortfolioAssessment,
  PortfolioAssessmentStatus,
} from './entities/portfolio-assessment.entity.js';
import { PortfolioCriterionScore } from './entities/portfolio-criterion-score.entity.js';
import { PortfolioRubricCriterion } from './entities/portfolio-rubric-criterion.entity.js';
import { Portfolio, PortfolioStatus } from './entities/portfolio.entity.js';

const repoMock = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findByIds: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockAssessment = (): PortfolioAssessment =>
  ({
    id: 'assess-1',
    tenantId: 'tenant-1',
    portfolioId: 'portfolio-1',
    rubricId: 'rubric-1',
    status: PortfolioAssessmentStatus.IN_PROGRESS,
    totalScore: null,
    maxPossibleScore: null,
    scorePercentage: null,
    overallFeedback: null,
    assessedBy: null,
    completedAt: null,
    criterionScores: [],
    portfolio: null,
    rubric: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as PortfolioAssessment);

describe('PortfolioAssessmentsService', () => {
  let service: PortfolioAssessmentsService;
  let assessmentRepo: ReturnType<typeof repoMock>;
  let scoreRepo: ReturnType<typeof repoMock>;
  let criterionRepo: ReturnType<typeof repoMock>;
  let portfolioRepo: ReturnType<typeof repoMock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioAssessmentsService,
        {
          provide: getRepositoryToken(PortfolioAssessment),
          useFactory: repoMock,
        },
        {
          provide: getRepositoryToken(PortfolioCriterionScore),
          useFactory: repoMock,
        },
        {
          provide: getRepositoryToken(PortfolioRubricCriterion),
          useFactory: repoMock,
        },
        { provide: getRepositoryToken(Portfolio), useFactory: repoMock },
      ],
    }).compile();

    service = module.get<PortfolioAssessmentsService>(
      PortfolioAssessmentsService,
    );
    assessmentRepo = module.get(getRepositoryToken(PortfolioAssessment));
    scoreRepo = module.get(getRepositoryToken(PortfolioCriterionScore));
    criterionRepo = module.get(getRepositoryToken(PortfolioRubricCriterion));
    portfolioRepo = module.get(getRepositoryToken(Portfolio));
  });

  describe('create', () => {
    it('should create an assessment in in_progress state', async () => {
      const assessment = mockAssessment();
      assessmentRepo.create.mockReturnValue(assessment);
      assessmentRepo.save.mockResolvedValue(assessment);

      const result = await service.create('tenant-1', {
        portfolioId: 'portfolio-1',
        rubricId: 'rubric-1',
      });

      expect(assessmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PortfolioAssessmentStatus.IN_PROGRESS,
        }),
      );
      expect(result).toEqual(assessment);
    });
  });

  describe('addCriterionScore', () => {
    it('should add a criterion score to an assessment', async () => {
      const assessment = mockAssessment();
      const score: Partial<PortfolioCriterionScore> = {
        id: 'score-1',
        assessmentId: 'assess-1',
        criterionId: 'crit-1',
        score: 8,
        feedback: null,
      };
      assessmentRepo.findOne.mockResolvedValue({
        ...assessment,
        criterionScores: [],
        portfolio: null,
        rubric: null,
      });
      scoreRepo.create.mockReturnValue(score);
      scoreRepo.save.mockResolvedValue(score);

      const result = await service.addCriterionScore('tenant-1', 'assess-1', {
        criterionId: 'crit-1',
        score: 8,
      });

      expect(scoreRepo.save).toHaveBeenCalled();
      expect(result.score).toBe(8);
    });
  });

  describe('complete', () => {
    it('should complete assessment and compute scores', async () => {
      const assessment = { ...mockAssessment() };
      const scores = [
        { criterionId: 'crit-1', score: '8' },
        { criterionId: 'crit-2', score: '6' },
      ] as unknown as PortfolioCriterionScore[];
      const criteria = [
        { id: 'crit-1', maxScore: '10', weight: '1' },
        { id: 'crit-2', maxScore: '10', weight: '1' },
      ] as unknown as PortfolioRubricCriterion[];
      const portfolio = {
        id: 'portfolio-1',
        tenantId: 'tenant-1',
        status: PortfolioStatus.SUBMITTED,
      } as Portfolio;

      assessmentRepo.findOne.mockResolvedValue({
        ...assessment,
        criterionScores: [],
        portfolio: null,
        rubric: null,
      });
      scoreRepo.find.mockResolvedValue(scores);
      criterionRepo.findByIds.mockResolvedValue(criteria);
      assessmentRepo.save.mockImplementation((a: PortfolioAssessment) =>
        Promise.resolve(a),
      );
      portfolioRepo.findOne.mockResolvedValue(portfolio);
      portfolioRepo.save.mockImplementation((p: Portfolio) =>
        Promise.resolve(p),
      );

      const result = await service.complete('tenant-1', 'assess-1', {
        overallFeedback: 'Well done',
      });

      expect(result.status).toBe(PortfolioAssessmentStatus.COMPLETED);
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(portfolioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: PortfolioStatus.REVIEWED }),
      );
    });
  });

  describe('getSummary', () => {
    it('should return student portfolio summary', async () => {
      const portfolio = {
        id: 'portfolio-1',
        status: PortfolioStatus.REVIEWED,
      } as Portfolio;

      portfolioRepo.find.mockResolvedValue([portfolio]);

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'assess-1', scorePercentage: '85', portfolioId: 'portfolio-1' },
        ]),
      };
      assessmentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getSummary('tenant-1', 'student-1');

      expect(result.studentProfileId).toBe('student-1');
      expect(result.totalPortfolios).toBe(1);
      expect(result.reviewedPortfolios).toBe(1);
      expect(result.averageScorePercentage).toBe(85);
    });

    it('should return zeroes when no portfolios', async () => {
      portfolioRepo.find.mockResolvedValue([]);

      const result = await service.getSummary('tenant-1', 'student-2');

      expect(result.totalPortfolios).toBe(0);
      expect(result.averageScorePercentage).toBeNull();
      expect(result.latestAssessments).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      assessmentRepo.findOne.mockResolvedValue(null);
      await expect(
        service.findOne('tenant-1', 'missing-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
