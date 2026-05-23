import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { WorkplaceCompetencySignOffsService } from './workplace-competency-signoffs.service.js';
import { WorkplaceCompetencySignOff } from './entities/workplace-competency-signoff.entity.js';
import { ProficiencyLevel } from '../skills/entities/skill-enums.js';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid';
const id = 'signoff-uuid';

describe('WorkplaceCompetencySignOffsService', () => {
  let service: WorkplaceCompetencySignOffsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkplaceCompetencySignOffsService,
        { provide: getRepositoryToken(WorkplaceCompetencySignOff), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(WorkplaceCompetencySignOffsService);
    repo = module.get(getRepositoryToken(WorkplaceCompetencySignOff));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      placementId: 'placement-uuid',
      studentProfileId: 'student-uuid',
      skillId: 'skill-uuid',
      skillName: 'TypeScript',
      demonstratedLevel: ProficiencyLevel.INTERMEDIATE,
      signedOffBy: 'Supervisor',
    };

    it('should create a sign-off', async () => {
      repo.findOne.mockResolvedValue(null);
      const signOff = { id, tenantId, ...dto };
      repo.create.mockReturnValue(signOff);
      repo.save.mockResolvedValue(signOff);
      const result = await service.create(tenantId, dto as any);
      expect(result).toEqual(signOff);
    });

    it('should throw ConflictException for duplicate', async () => {
      repo.findOne.mockResolvedValue({ id, tenantId, ...dto });
      await expect(service.create(tenantId, dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByPlacement', () => {
    it('should return sign-offs for a placement', async () => {
      repo.find.mockResolvedValue([{ id }]);
      const result = await service.findByPlacement(tenantId, 'placement-uuid');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByStudent', () => {
    it('should return sign-offs for a student', async () => {
      repo.find.mockResolvedValue([{ id }]);
      const result = await service.findByStudent(tenantId, 'student-uuid');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(tenantId, id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a sign-off', async () => {
      repo.findOne.mockResolvedValue({ id, tenantId });
      repo.remove.mockResolvedValue(undefined);
      await expect(service.remove(tenantId, id)).resolves.toBeUndefined();
    });
  });
});
