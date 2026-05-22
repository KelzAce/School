import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PortfolioService } from './portfolio.service.js';
import { Portfolio, PortfolioStatus } from './entities/portfolio.entity.js';

const mockPortfolio = (): Portfolio =>
  ({
    id: 'uuid-1',
    tenantId: 'tenant-1',
    studentProfileId: 'student-1',
    courseId: null,
    title: 'Test Portfolio',
    description: null,
    status: PortfolioStatus.DRAFT,
    submittedAt: null,
    reviewedAt: null,
    tags: [],
    items: [],
    assessments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Portfolio);

const repoMock = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

describe('PortfolioService', () => {
  let service: PortfolioService;
  let repo: ReturnType<typeof repoMock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: getRepositoryToken(Portfolio), useFactory: repoMock },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    repo = module.get(getRepositoryToken(Portfolio));
  });

  describe('create', () => {
    it('should create and return a portfolio', async () => {
      const portfolio = mockPortfolio();
      repo.create.mockReturnValue(portfolio);
      repo.save.mockResolvedValue(portfolio);

      const result = await service.create('tenant-1', {
        studentProfileId: 'student-1',
        title: 'Test Portfolio',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'tenant-1', title: 'Test Portfolio' }),
      );
      expect(result).toEqual(portfolio);
    });
  });

  describe('findAll', () => {
    it('should return paginated portfolios', async () => {
      const portfolio = mockPortfolio();
      repo.findAndCount.mockResolvedValue([[portfolio], 1]);

      const result = await service.findAll('tenant-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a portfolio by id', async () => {
      const portfolio = mockPortfolio();
      repo.findOne.mockResolvedValue(portfolio);

      const result = await service.findOne('tenant-1', 'uuid-1');
      expect(result).toEqual(portfolio);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('tenant-1', 'uuid-missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByStudent', () => {
    it('should return portfolios for a student', async () => {
      const portfolio = mockPortfolio();
      repo.find.mockResolvedValue([portfolio]);

      const result = await service.findByStudent('tenant-1', 'student-1');
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1', studentProfileId: 'student-1' } }),
      );
    });
  });

  describe('submit', () => {
    it('should set status to submitted and set submittedAt', async () => {
      const portfolio = mockPortfolio();
      repo.findOne.mockResolvedValue(portfolio);
      repo.save.mockImplementation((p: Portfolio) => Promise.resolve(p));

      const result = await service.submit('tenant-1', 'uuid-1');

      expect(result.status).toBe(PortfolioStatus.SUBMITTED);
      expect(result.submittedAt).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('should remove a portfolio', async () => {
      const portfolio = mockPortfolio();
      repo.findOne.mockResolvedValue(portfolio);
      repo.remove.mockResolvedValue(portfolio);

      await service.remove('tenant-1', 'uuid-1');
      expect(repo.remove).toHaveBeenCalledWith(portfolio);
    });
  });
});
