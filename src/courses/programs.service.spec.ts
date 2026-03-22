import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { Program, ProgramStatus } from './entities/program.entity';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
});

describe('ProgramsService', () => {
  let service: ProgramsService;
  let repo: MockRepository<Program>;

  const tenantId = '00000000-0000-0000-0000-000000000001';

  const mockProgram: Program = {
    id: '00000000-0000-0000-0000-000000000060',
    tenantId,
    code: 'DIP-SE-2026',
    name: 'Diploma in Software Engineering',
    description: 'A 2-year vocational diploma',
    learningTrack: 'STEM',
    durationWeeks: 48,
    totalCredits: 120,
    status: ProgramStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Program;

  beforeEach(async () => {
    repo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        { provide: getRepositoryToken(Program), useValue: repo },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
  });

  describe('create', () => {
    it('should create a program', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockProgram);
      repo.save!.mockResolvedValue(mockProgram);

      const result = await service.create(tenantId, {
        code: 'DIP-SE-2026',
        name: 'Diploma in Software Engineering',
      });
      expect(result).toEqual(mockProgram);
    });

    it('should throw ConflictException for duplicate code', async () => {
      repo.findOne!.mockResolvedValue(mockProgram);

      await expect(
        service.create(tenantId, { code: 'DIP-SE-2026', name: 'Duplicate' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated programs', async () => {
      repo.findAndCount!.mockResolvedValue([[mockProgram], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a program with courses', async () => {
      repo.findOne!.mockResolvedValue(mockProgram);

      const result = await service.findOne(tenantId, mockProgram.id);
      expect(result.id).toBe(mockProgram.id);
    });

    it('should throw NotFoundException for unknown id', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a program', async () => {
      const updated = { ...mockProgram, name: 'Updated Name' };
      repo.findOne!.mockResolvedValue(mockProgram);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update(tenantId, mockProgram.id, {
        name: 'Updated Name',
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw ConflictException for duplicate code on update', async () => {
      const other = { ...mockProgram, id: 'other-id', code: 'OTHER-CODE' };
      repo.findOne!
        .mockResolvedValueOnce(mockProgram) // findOne for the program
        .mockResolvedValueOnce(other); // findOne for conflict check

      await expect(
        service.update(tenantId, mockProgram.id, { code: 'OTHER-CODE' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a program', async () => {
      repo.findOne!.mockResolvedValue(mockProgram);
      repo.remove!.mockResolvedValue(mockProgram);

      await service.remove(tenantId, mockProgram.id);
      expect(repo.remove).toHaveBeenCalledWith(mockProgram);
    });
  });
});
