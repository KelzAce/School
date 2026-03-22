import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SkillCategoriesService } from './skill-categories.service';
import { SkillCategory } from './entities/skill-category.entity';

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

describe('SkillCategoriesService', () => {
  let service: SkillCategoriesService;
  let repo: MockRepository<SkillCategory>;

  const tenantId = '00000000-0000-0000-0000-000000000001';

  const mockCategory: SkillCategory = {
    id: '00000000-0000-0000-0000-000000000010',
    tenantId,
    code: 'TECH',
    name: 'Technical Skills',
    description: 'Core technical competencies',
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenant: null as any,
    skills: [],
  } as SkillCategory;

  beforeEach(async () => {
    repo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillCategoriesService,
        { provide: getRepositoryToken(SkillCategory), useValue: repo },
      ],
    }).compile();

    service = module.get<SkillCategoriesService>(SkillCategoriesService);
  });

  describe('create', () => {
    it('should create a skill category', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockCategory);
      repo.save!.mockResolvedValue(mockCategory);

      const result = await service.create(tenantId, {
        code: 'TECH',
        name: 'Technical Skills',
      });

      expect(result).toEqual(mockCategory);
      expect(repo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate code', async () => {
      repo.findOne!.mockResolvedValue(mockCategory);

      await expect(
        service.create(tenantId, { code: 'TECH', name: 'Technical Skills' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      repo.findAndCount!.mockResolvedValue([[mockCategory], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a category with skills', async () => {
      repo.findOne!.mockResolvedValue(mockCategory);

      const result = await service.findOne(tenantId, mockCategory.id);
      expect(result.id).toBe(mockCategory.id);
    });

    it('should throw NotFoundException for unknown id', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(
        service.findOne(tenantId, 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updated = { ...mockCategory, name: 'Updated Name' };
      repo.findOne!.mockResolvedValue(mockCategory);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update(tenantId, mockCategory.id, {
        name: 'Updated Name',
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw ConflictException for taken code', async () => {
      repo.findOne!
        .mockResolvedValueOnce(mockCategory) // findOne
        .mockResolvedValueOnce({ ...mockCategory, id: 'other' }); // conflict

      await expect(
        service.update(tenantId, mockCategory.id, { code: 'SOFT' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      repo.findOne!.mockResolvedValue(mockCategory);
      repo.remove!.mockResolvedValue(mockCategory);

      const result = await service.remove(tenantId, mockCategory.id);
      expect(result).toEqual(mockCategory);
    });
  });
});
