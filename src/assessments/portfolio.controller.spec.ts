import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller.js';
import { PortfolioService } from './portfolio.service.js';
import { Portfolio, PortfolioStatus } from './entities/portfolio.entity.js';

const mockPortfolio = (): Portfolio =>
  ({
    id: 'uuid-1',
    tenantId: 'tenant-1',
    studentProfileId: 'student-1',
    title: 'Test Portfolio',
    status: PortfolioStatus.DRAFT,
    tags: [],
  } as unknown as Portfolio);

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByStudent: jest.fn(),
  update: jest.fn(),
  submit: jest.fn(),
  remove: jest.fn(),
});

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [{ provide: PortfolioService, useFactory: mockService }],
    }).compile();

    controller = module.get<PortfolioController>(PortfolioController);
    service = module.get(PortfolioService);
  });

  it('create calls service.create', async () => {
    const portfolio = mockPortfolio();
    service.create.mockResolvedValue(portfolio);

    const result = await controller.create('tenant-1', {
      studentProfileId: 'student-1',
      title: 'Test Portfolio',
    });
    expect(service.create).toHaveBeenCalledWith('tenant-1', expect.objectContaining({ title: 'Test Portfolio' }));
    expect(result).toEqual(portfolio);
  });

  it('findAll calls service.findAll', async () => {
    const paginatedResult = { data: [mockPortfolio()], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
    service.findAll.mockResolvedValue(paginatedResult);

    const result = await controller.findAll('tenant-1', { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('tenant-1', { page: 1, limit: 20 });
    expect(result).toEqual(paginatedResult);
  });

  it('findByStudent calls service.findByStudent', async () => {
    const portfolios = [mockPortfolio()];
    service.findByStudent.mockResolvedValue(portfolios);

    const result = await controller.findByStudent('tenant-1', 'student-1');
    expect(service.findByStudent).toHaveBeenCalledWith('tenant-1', 'student-1');
    expect(result).toEqual(portfolios);
  });

  it('findOne calls service.findOne', async () => {
    const portfolio = mockPortfolio();
    service.findOne.mockResolvedValue(portfolio);

    const result = await controller.findOne('tenant-1', 'uuid-1');
    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'uuid-1');
    expect(result).toEqual(portfolio);
  });

  it('submit calls service.submit', async () => {
    const portfolio = { ...mockPortfolio(), status: PortfolioStatus.SUBMITTED };
    service.submit.mockResolvedValue(portfolio);

    const result = await controller.submit('tenant-1', 'uuid-1', {});
    expect(service.submit).toHaveBeenCalledWith('tenant-1', 'uuid-1');
    expect(result.status).toBe(PortfolioStatus.SUBMITTED);
  });

  it('remove calls service.remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('tenant-1', 'uuid-1');
    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'uuid-1');
  });
});
