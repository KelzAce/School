import { Test, TestingModule } from '@nestjs/testing';
import { CareerPathwaysController } from './career-pathways.controller.js';
import { CareerPathwaysService } from './career-pathways.service.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addSkill: jest.fn(),
  removeSkill: jest.fn(),
  getSkillTree: jest.fn(),
  getStudentProgress: jest.fn(),
  getStudentSuggestions: jest.fn(),
};

describe('CareerPathwaysController', () => {
  let controller: CareerPathwaysController;

  const tenantId = 'tenant-uuid';
  const pathwayId = '00000000-0000-0000-0000-000000000001';
  const studentProfileId = '00000000-0000-0000-0000-000000000002';
  const skillId = '00000000-0000-0000-0000-000000000003';
  const requester = { id: 'user-uuid', role: 'admin' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareerPathwaysController],
      providers: [{ provide: CareerPathwaysService, useValue: mockService }],
    }).compile();

    controller = module.get<CareerPathwaysController>(CareerPathwaysController);
    jest.clearAllMocks();
  });

  it('create - delegates to service', async () => {
    const dto = { title: 'Data Engineer', slug: 'data-engineer' };
    mockService.create.mockResolvedValue({ id: pathwayId, ...dto });

    const result = await controller.create(tenantId, dto as any);
    expect(mockService.create).toHaveBeenCalledWith(tenantId, dto);
    expect(result).toEqual({ id: pathwayId, ...dto });
  });

  it('findAll - delegates to service with empty options when no query params', async () => {
    mockService.findAll.mockResolvedValue([{ id: pathwayId, title: 'Data Engineer' }]);

    const result = await controller.findAll(tenantId, undefined, undefined);
    expect(mockService.findAll).toHaveBeenCalledWith(tenantId, {});
    expect(result).toHaveLength(1);
  });

  it('findOne - delegates to service', async () => {
    mockService.findOne.mockResolvedValue({ id: pathwayId, title: 'Data Engineer' });

    const result = await controller.findOne(tenantId, pathwayId);
    expect(mockService.findOne).toHaveBeenCalledWith(tenantId, pathwayId);
    expect(result.id).toBe(pathwayId);
  });

  it('update - delegates to service', async () => {
    mockService.update.mockResolvedValue({ id: pathwayId, title: 'Updated' });

    const result = await controller.update(tenantId, pathwayId, { title: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith(tenantId, pathwayId, { title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('remove - delegates to service', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(tenantId, pathwayId);
    expect(mockService.remove).toHaveBeenCalledWith(tenantId, pathwayId);
  });

  it('addSkill - delegates to service', async () => {
    const dto = { skillId, requiredLevel: ProficiencyLevel.INTERMEDIATE, isCritical: true };
    mockService.addSkill.mockResolvedValue({ id: 'ps-id', pathwayId, skillId });

    const result = await controller.addSkill(tenantId, pathwayId, dto as any);
    expect(mockService.addSkill).toHaveBeenCalledWith(tenantId, pathwayId, dto);
    expect(result.pathwayId).toBe(pathwayId);
  });

  it('removeSkill - delegates to service', async () => {
    mockService.removeSkill.mockResolvedValue(undefined);

    await controller.removeSkill(tenantId, pathwayId, skillId);
    expect(mockService.removeSkill).toHaveBeenCalledWith(tenantId, pathwayId, skillId);
  });

  it('getSkillTree - delegates to service', async () => {
    mockService.getSkillTree.mockResolvedValue([]);

    const result = await controller.getSkillTree(tenantId, pathwayId);
    expect(mockService.getSkillTree).toHaveBeenCalledWith(tenantId, pathwayId);
    expect(result).toEqual([]);
  });

  it('getStudentProgress - delegates to service', async () => {
    mockService.getStudentProgress.mockResolvedValue({ completionPercent: 75 });

    const result = await controller.getStudentProgress(tenantId, pathwayId, studentProfileId, requester);
    expect(mockService.getStudentProgress).toHaveBeenCalledWith(
      tenantId,
      studentProfileId,
      pathwayId,
      requester,
    );
    expect(result.completionPercent).toBe(75);
  });

  it('getStudentSuggestions - delegates to service', async () => {
    mockService.getStudentSuggestions.mockResolvedValue([{ pathwayId, completionPercent: 60 }]);

    const result = await controller.getStudentSuggestions(tenantId, studentProfileId, requester);
    expect(mockService.getStudentSuggestions).toHaveBeenCalledWith(
      tenantId,
      studentProfileId,
      requester,
    );
    expect(result).toHaveLength(1);
  });
});
