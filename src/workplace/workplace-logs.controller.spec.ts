import { Test, TestingModule } from '@nestjs/testing';
import { WorkplaceLogsController } from './workplace-logs.controller.js';
import { WorkplaceLogsService } from './workplace-logs.service.js';
import { LogStatus } from './entities/workplace-log.entity.js';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPlacement: jest.fn(),
  findByStudent: jest.fn(),
  update: jest.fn(),
  review: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid';
const id = 'log-uuid';

describe('WorkplaceLogsController', () => {
  let controller: WorkplaceLogsController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkplaceLogsController],
      providers: [{ provide: WorkplaceLogsService, useFactory: mockService }],
    }).compile();

    controller = module.get(WorkplaceLogsController);
    service = module.get(WorkplaceLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service.create', () => {
    const dto = { placementId: 'pid', studentProfileId: 'sid', logDate: '2024-01-01', hoursWorked: 8, activities: 'work' };
    service.create.mockResolvedValue({ id });
    controller.create(tenantId, dto as any);
    expect(service.create).toHaveBeenCalledWith(tenantId, dto);
  });

  it('findByPlacement calls service.findByPlacement', () => {
    service.findByPlacement.mockResolvedValue([]);
    controller.findByPlacement(tenantId, 'placement-uuid');
    expect(service.findByPlacement).toHaveBeenCalledWith(tenantId, 'placement-uuid');
  });

  it('findByStudent calls service.findByStudent', () => {
    service.findByStudent.mockResolvedValue([]);
    controller.findByStudent(tenantId, 'student-uuid');
    expect(service.findByStudent).toHaveBeenCalledWith(tenantId, 'student-uuid');
  });

  it('findOne calls service.findOne', () => {
    service.findOne.mockResolvedValue({ id });
    controller.findOne(tenantId, id);
    expect(service.findOne).toHaveBeenCalledWith(tenantId, id);
  });

  it('review calls service.review', () => {
    const dto = { status: LogStatus.APPROVED, reviewedBy: 'sup' };
    service.review.mockResolvedValue({ id });
    controller.review(tenantId, id, dto as any);
    expect(service.review).toHaveBeenCalledWith(tenantId, id, dto);
  });

  it('remove calls service.remove', () => {
    service.remove.mockResolvedValue(undefined);
    controller.remove(tenantId, id);
    expect(service.remove).toHaveBeenCalledWith(tenantId, id);
  });
});
