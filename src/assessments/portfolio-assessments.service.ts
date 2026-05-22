import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PortfolioAssessment,
  PortfolioAssessmentStatus,
} from './entities/portfolio-assessment.entity.js';
import { PortfolioCriterionScore } from './entities/portfolio-criterion-score.entity.js';
import { PortfolioRubricCriterion } from './entities/portfolio-rubric-criterion.entity.js';
import { Portfolio, PortfolioStatus } from './entities/portfolio.entity.js';
import {
  CreatePortfolioAssessmentDto,
  AddCriterionScoreDto,
  CompleteAssessmentDto,
} from './dto/portfolio-assessment.dto.js';
import { PaginationQueryDto, PaginatedResult } from '../common/index.js';

export interface StudentPortfolioSummary {
  studentProfileId: string;
  totalPortfolios: number;
  submittedPortfolios: number;
  reviewedPortfolios: number;
  averageScorePercentage: number | null;
  latestAssessments: PortfolioAssessment[];
}

@Injectable()
export class PortfolioAssessmentsService {
  constructor(
    @InjectRepository(PortfolioAssessment)
    private readonly assessmentRepo: Repository<PortfolioAssessment>,
    @InjectRepository(PortfolioCriterionScore)
    private readonly scoreRepo: Repository<PortfolioCriterionScore>,
    @InjectRepository(PortfolioRubricCriterion)
    private readonly criterionRepo: Repository<PortfolioRubricCriterion>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
  ) {}

  async create(
    tenantId: string,
    dto: CreatePortfolioAssessmentDto,
  ): Promise<PortfolioAssessment> {
    const assessment = this.assessmentRepo.create({
      tenantId,
      portfolioId: dto.portfolioId,
      rubricId: dto.rubricId,
      assessedBy: dto.assessedBy ?? null,
      overallFeedback: dto.overallFeedback ?? null,
      status: PortfolioAssessmentStatus.IN_PROGRESS,
    } as Partial<PortfolioAssessment>);
    return this.assessmentRepo.save(assessment);
  }

  async addCriterionScore(
    tenantId: string,
    assessmentId: string,
    dto: AddCriterionScoreDto,
  ): Promise<PortfolioCriterionScore> {
    const assessment = await this.findOne(tenantId, assessmentId);
    const score = this.scoreRepo.create({
      assessmentId: assessment.id,
      criterionId: dto.criterionId,
      score: dto.score,
      feedback: dto.feedback ?? null,
    } as Partial<PortfolioCriterionScore>);
    return this.scoreRepo.save(score);
  }

  async complete(
    tenantId: string,
    assessmentId: string,
    dto: CompleteAssessmentDto,
  ): Promise<PortfolioAssessment> {
    const assessment = await this.findOne(tenantId, assessmentId);

    const scores = await this.scoreRepo.find({
      where: { assessmentId: assessment.id },
    });

    const criterionIds = scores
      .map((s) => s.criterionId)
      .filter((id): id is string => id !== null);

    let maxPossibleScore = 0;
    if (criterionIds.length > 0) {
      const criteria = await this.criterionRepo.findByIds(criterionIds);
      const criterionMap = new Map(criteria.map((c) => [c.id, c]));
      maxPossibleScore = criteria.reduce((sum, c) => sum + Number(c.maxScore), 0);

      // Compute total score as sum of each score * weight / total weight
      const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0);
      const weightedScore = scores.reduce((sum, s) => {
        const criterion = s.criterionId ? criterionMap.get(s.criterionId) : null;
        const weight = criterion ? Number(criterion.weight) : 1;
        return sum + Number(s.score) * weight;
      }, 0);
      const totalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
      const scorePercentage =
        maxPossibleScore > 0
          ? (totalScore / (maxPossibleScore / (criterionIds.length || 1))) * 100
          : null;

      assessment.totalScore = parseFloat(totalScore.toFixed(2));
      assessment.maxPossibleScore = parseFloat(maxPossibleScore.toFixed(2));
      assessment.scorePercentage = scorePercentage !== null
        ? parseFloat(Math.min(scorePercentage, 100).toFixed(2))
        : null;
    } else {
      const totalScore = scores.reduce((sum, s) => sum + Number(s.score), 0);
      assessment.totalScore = parseFloat(totalScore.toFixed(2));
      assessment.maxPossibleScore = null;
      assessment.scorePercentage = null;
    }

    if (dto.overallFeedback !== undefined) {
      assessment.overallFeedback = dto.overallFeedback ?? null;
    }
    if (dto.assessedBy !== undefined) {
      assessment.assessedBy = dto.assessedBy ?? null;
    }
    assessment.status = PortfolioAssessmentStatus.COMPLETED;
    assessment.completedAt = new Date();

    const saved = await this.assessmentRepo.save(assessment);

    // Update portfolio status to reviewed
    const portfolio = await this.portfolioRepo.findOne({
      where: { id: assessment.portfolioId, tenantId },
    });
    if (portfolio) {
      portfolio.status = PortfolioStatus.REVIEWED;
      portfolio.reviewedAt = new Date();
      await this.portfolioRepo.save(portfolio);
    }

    return saved;
  }

  async findAll(
    tenantId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<PortfolioAssessment>> {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await this.assessmentRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<PortfolioAssessment> {
    const assessment = await this.assessmentRepo.findOne({
      where: { id, tenantId },
      relations: ['criterionScores', 'portfolio', 'rubric'],
    });
    if (!assessment) {
      throw new NotFoundException(`Portfolio assessment "${id}" not found`);
    }
    return assessment;
  }

  async findByPortfolio(
    tenantId: string,
    portfolioId: string,
  ): Promise<PortfolioAssessment[]> {
    return this.assessmentRepo.find({
      where: { tenantId, portfolioId },
      relations: ['criterionScores', 'rubric'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSummary(
    tenantId: string,
    studentProfileId: string,
  ): Promise<StudentPortfolioSummary> {
    const portfolios = await this.portfolioRepo.find({
      where: { tenantId, studentProfileId },
    });

    const totalPortfolios = portfolios.length;
    const submittedPortfolios = portfolios.filter(
      (p) =>
        p.status === PortfolioStatus.SUBMITTED ||
        p.status === PortfolioStatus.UNDER_REVIEW ||
        p.status === PortfolioStatus.REVIEWED,
    ).length;
    const reviewedPortfolios = portfolios.filter(
      (p) => p.status === PortfolioStatus.REVIEWED,
    ).length;

    const portfolioIds = portfolios.map((p) => p.id);
    let averageScorePercentage: number | null = null;
    let latestAssessments: PortfolioAssessment[] = [];

    if (portfolioIds.length > 0) {
      const assessments = await this.assessmentRepo
        .createQueryBuilder('a')
        .where('a.tenantId = :tenantId', { tenantId })
        .andWhere('a.portfolioId IN (:...portfolioIds)', { portfolioIds })
        .andWhere('a.status = :status', {
          status: PortfolioAssessmentStatus.COMPLETED,
        })
        .orderBy('a.completedAt', 'DESC')
        .getMany();

      const withScores = assessments.filter(
        (a) => a.scorePercentage !== null,
      );
      if (withScores.length > 0) {
        const sum = withScores.reduce(
          (acc, a) => acc + Number(a.scorePercentage),
          0,
        );
        averageScorePercentage = parseFloat(
          (sum / withScores.length).toFixed(2),
        );
      }

      latestAssessments = assessments.slice(0, 5);
    }

    return {
      studentProfileId,
      totalPortfolios,
      submittedPortfolios,
      reviewedPortfolios,
      averageScorePercentage,
      latestAssessments,
    };
  }
}
