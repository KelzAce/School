import { Test, TestingModule } from '@nestjs/testing';
import { SupervisorAssessmentsController } from './supervisor-assessments.controller.js';
import { SupervisorAssessmentsService } from './supervisor-assessments.service.js';
import { SupervisorRating } from './entities/supervisor-assessment.entity.js';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPlacement: jest.fn(),
  findByStudent: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid';
const id = 'assessment-uuid';

describe('SupervisorAssessmentsController', () => {
  let controller: SupervisorAssessmentsController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisorAssessmentsController],
      providers: [{ provide: SupervisorAssessmentsService, useFactory: mockService }],
    }).compile();

    controller = module.get(SupervisorAssessmentsController);
    service = module.get(SupervisorAssessmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create calls service.create', () => {
    const dto = { placementId: 'pid', studentProfileId: 'sid', assessmentPeriod: 'Week 1', assessedBy: 'John', overallRating: SupervisorRating.GOOD, technicalSkillsRating: SupervisorRating.GOOD, communicationRating: SupervisorRating.GOOD, teamworkRating: SupervisorRating.GOOD, initiativeRating: SupervisorRating.GOOD, reliabilityRating: SupervisorRating.GOOD };
    service.create.mockResolvedValue({ id });
    controller.create(tenantId, dto as any);
    expect(service.create).toHaveBeenCalledWith(tenantId, dto);
  });

  it('findAll calls service.findAll', () => {
    service.findAll.mockResolvedValue({ data: [], meta: {} });
    controller.findAll(tenantId, {});
    expect(service.findAll).toHaveBeenCalledWith(tenantId, {});
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

  it('update calls service.update', () => {
    service.update.mockResolvedValue({ id });
    controller.update(tenantId, id, {} as any);
    expect(service.update).toHaveBeenCalledWith(tenantId, id, {});
  });

  it('remove calls service.remove', () => {
    service.remove.mockResolvedValue(undefined);
    controller.remove(tenantId, id);
    expect(service.remove).toHaveBeenCalledWith(tenantId, id);
  });
});
