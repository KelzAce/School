import { Test, TestingModule } from '@nestjs/testing';
import { WorkplacePlacementsController } from './workplace-placements.controller.js';
import { WorkplacePlacementsService } from './workplace-placements.service.js';
import { PlacementType } from './entities/workplace-placement.entity.js';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByStudent: jest.fn(),
  update: jest.fn(),
  complete: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid';
const id = 'placement-uuid';

describe('WorkplacePlacementsController', () => {
  let controller: WorkplacePlacementsController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkplacePlacementsController],
      providers: [{ provide: WorkplacePlacementsService, useFactory: mockService }],
    }).compile();

    controller = module.get(WorkplacePlacementsController);
    service = module.get(WorkplacePlacementsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service.create', () => {
    const dto = { studentProfileId: 'sid', partnerId: 'pid', partnerName: 'Corp', title: 'Intern', type: PlacementType.INTERNSHIP, startDate: '2024-01-01' };
    service.create.mockResolvedValue({ id });
    controller.create(tenantId, dto as any);
    expect(service.create).toHaveBeenCalledWith(tenantId, dto);
  });

  it('findAll calls service.findAll', () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} });
    controller.findAll(tenantId, {});
    expect(service.findAll).toHaveBeenCalledWith(tenantId, {});
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

  it('update calls service.update', () => {
    service.update.mockResolvedValue({ id });
    controller.update(tenantId, id, { title: 'New' } as any);
    expect(service.update).toHaveBeenCalledWith(tenantId, id, { title: 'New' });
  });

  it('complete calls service.complete', () => {
    service.complete.mockResolvedValue({ id });
    controller.complete(tenantId, id);
    expect(service.complete).toHaveBeenCalledWith(tenantId, id);
  });

  it('remove calls service.remove', () => {
    service.remove.mockResolvedValue(undefined);
    controller.remove(tenantId, id);
    expect(service.remove).toHaveBeenCalledWith(tenantId, id);
  });
});
