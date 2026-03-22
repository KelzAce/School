import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { SkillType } from './entities/skill.entity';

describe('SkillsController', () => {
  let controller: SkillsController;
  let service: Partial<Record<keyof SkillsService, jest.Mock>>;

  const tenantId = '00000000-0000-0000-0000-000000000001';

  const mockSkill = {
    id: '00000000-0000-0000-0000-000000000020',
    tenantId,
    categoryId: '00000000-0000-0000-0000-000000000010',
    code: 'WLD-101',
    name: 'MIG Welding',
    type: SkillType.TECHNICAL,
    onetCode: '51-4121.00',
    tags: ['welding'],
    sortOrder: 0,
  };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue(mockSkill),
      findAll: jest.fn().mockResolvedValue({
        data: [mockSkill],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      }),
      findOne: jest.fn().mockResolvedValue(mockSkill),
      update: jest.fn().mockResolvedValue(mockSkill),
      remove: jest.fn().mockResolvedValue(mockSkill),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [{ provide: SkillsService, useValue: service }],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a skill', async () => {
      const result = await controller.create(tenantId, {
        categoryId: mockSkill.categoryId,
        code: 'WLD-101',
        name: 'MIG Welding',
      });
      expect(result).toEqual(mockSkill);
    });
  });

  describe('findAll', () => {
    it('should return paginated skills', async () => {
      const result = await controller.findAll(
        tenantId,
        { page: 1, limit: 20 },
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a skill by id', async () => {
      const result = await controller.findOne(tenantId, mockSkill.id);
      expect(result.id).toBe(mockSkill.id);
    });
  });

  describe('update', () => {
    it('should update a skill', async () => {
      const result = await controller.update(tenantId, mockSkill.id, {
        name: 'TIG Welding',
      });
      expect(result).toEqual(mockSkill);
    });
  });

  describe('remove', () => {
    it('should remove a skill', async () => {
      const result = await controller.remove(tenantId, mockSkill.id);
      expect(result).toEqual(mockSkill);
    });
  });
});
