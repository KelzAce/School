import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Skill, SkillType } from './entities/skill.entity';

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
  find: jest.fn(),
  remove: jest.fn(),
});

describe('SkillsService', () => {
  let service: SkillsService;
  let repo: MockRepository<Skill>;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const categoryId = '00000000-0000-0000-0000-000000000010';

  const mockSkill: Skill = {
    id: '00000000-0000-0000-0000-000000000020',
    tenantId,
    categoryId,
    parentId: null,
    code: 'WLD-101',
    name: 'MIG Welding',
    description: 'Metal Inert Gas welding fundamentals',
    type: SkillType.TECHNICAL,
    onetCode: '51-4121.00',
    escoCode: null,
    tags: ['welding', 'fabrication'],
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: null as any,
    category: null as any,
    parent: null,
    children: [],
    courseSkills: [],
  } as Skill;

  beforeEach(async () => {
    repo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: getRepositoryToken(Skill), useValue: repo },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  describe('create', () => {
    it('should create a skill', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockSkill);
      repo.save!.mockResolvedValue(mockSkill);

      const result = await service.create(tenantId, {
        categoryId,
        code: 'WLD-101',
        name: 'MIG Welding',
        type: 'technical',
        onetCode: '51-4121.00',
      });

      expect(result).toEqual(mockSkill);
    });

    it('should throw ConflictException for duplicate code', async () => {
      repo.findOne!.mockResolvedValue(mockSkill);

      await expect(
        service.create(tenantId, {
          categoryId,
          code: 'WLD-101',
          name: 'MIG Welding',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated skills', async () => {
      repo.findAndCount!.mockResolvedValue([[mockSkill], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by categoryId', async () => {
      repo.findAndCount!.mockResolvedValue([[mockSkill], 1]);

      await service.findAll(tenantId, { page: 1, limit: 20 }, categoryId);

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId }),
        }),
      );
    });

    it('should filter by type', async () => {
      repo.findAndCount!.mockResolvedValue([[mockSkill], 1]);

      await service.findAll(
        tenantId,
        { page: 1, limit: 20 },
        undefined,
        'technical',
      );

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'technical' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a skill with relations', async () => {
      repo.findOne!.mockResolvedValue(mockSkill);

      const result = await service.findOne(tenantId, mockSkill.id);
      expect(result.id).toBe(mockSkill.id);
    });

    it('should throw NotFoundException for unknown id', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCategory', () => {
    it('should return skills for a category', async () => {
      repo.find!.mockResolvedValue([mockSkill]);

      const result = await service.findByCategory(tenantId, categoryId);
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a skill', async () => {
      const updated = { ...mockSkill, name: 'TIG Welding' };
      repo.findOne!.mockResolvedValue(mockSkill);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update(tenantId, mockSkill.id, {
        name: 'TIG Welding',
      });
      expect(result.name).toBe('TIG Welding');
    });

    it('should throw ConflictException for taken code', async () => {
      repo.findOne!
        .mockResolvedValueOnce(mockSkill)
        .mockResolvedValueOnce({ ...mockSkill, id: 'other' });

      await expect(
        service.update(tenantId, mockSkill.id, { code: 'WLD-102' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a skill', async () => {
      repo.findOne!.mockResolvedValue(mockSkill);
      repo.remove!.mockResolvedValue(mockSkill);

      const result = await service.remove(tenantId, mockSkill.id);
      expect(result).toEqual(mockSkill);
    });
  });
});
