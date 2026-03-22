import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgeTemplate, BadgeLevel } from './entities/badge-template.entity';
import { IssuedBadge, BadgeStatus } from './entities/issued-badge.entity';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const tenantId = 'tenant-uuid-1';
const templateId = 'template-uuid-1';
const issuedId = 'issued-uuid-1';
const studentProfileId = 'student-uuid-1';

const mockTemplate: Partial<BadgeTemplate> = {
  id: templateId,
  tenantId,
  code: 'WELD-BASIC',
  name: 'Basic Welding Competency',
  description: 'Demonstrates basic welding skills',
  level: BadgeLevel.FOUNDATION,
  skillRequirements: [],
  tags: [],
  isActive: true,
  tenant: null as any,
  issuedBadges: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockIssued: Partial<IssuedBadge> = {
  id: issuedId,
  tenantId,
  studentProfileId,
  badgeTemplateId: templateId,
  status: BadgeStatus.ISSUED,
  verificationHash: 'abc123hash',
  issuedAt: new Date(),
  badgeTemplate: null as any,
  studentProfile: null as any,
  tenant: null as any,
  evidence: null,
  issuedBy: null,
  expiresAt: null,
  revokedAt: null,
  revocationReason: null,
  verificationUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BadgesService', () => {
  let service: BadgesService;
  let templateRepo: MockRepository<BadgeTemplate>;
  let issuedRepo: MockRepository<IssuedBadge>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgesService,
        {
          provide: getRepositoryToken(BadgeTemplate),
          useValue: createMockRepository<BadgeTemplate>(),
        },
        {
          provide: getRepositoryToken(IssuedBadge),
          useValue: createMockRepository<IssuedBadge>(),
        },
      ],
    }).compile();

    service = module.get<BadgesService>(BadgesService);
    templateRepo = module.get(getRepositoryToken(BadgeTemplate));
    issuedRepo = module.get(getRepositoryToken(IssuedBadge));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTemplate', () => {
    it('should create a badge template', async () => {
      templateRepo.findOne!.mockResolvedValue(null);
      templateRepo.create!.mockReturnValue(mockTemplate);
      templateRepo.save!.mockResolvedValue(mockTemplate);

      const result = await service.createTemplate(tenantId, {
        code: 'WELD-BASIC',
        name: 'Basic Welding Competency',
      });
      expect(result).toEqual(mockTemplate);
      expect(templateRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate code', async () => {
      templateRepo.findOne!.mockResolvedValue(mockTemplate);

      await expect(
        service.createTemplate(tenantId, {
          code: 'WELD-BASIC',
          name: 'Basic Welding Competency',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllTemplates', () => {
    it('should return paginated templates', async () => {
      templateRepo.findAndCount!.mockResolvedValue([[mockTemplate], 1]);

      const result = await service.findAllTemplates(tenantId, {
        page: 1,
        limit: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOneTemplate', () => {
    it('should return a template', async () => {
      templateRepo.findOne!.mockResolvedValue(mockTemplate);
      const result = await service.findOneTemplate(tenantId, templateId);
      expect(result).toEqual(mockTemplate);
    });

    it('should throw NotFoundException if not found', async () => {
      templateRepo.findOne!.mockResolvedValue(null);
      await expect(
        service.findOneTemplate(tenantId, 'missing'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTemplate', () => {
    it('should update and return the template', async () => {
      const updated = { ...mockTemplate, name: 'Updated Name' };
      templateRepo.findOne!.mockResolvedValue({ ...mockTemplate });
      templateRepo.save!.mockResolvedValue(updated);

      const result = await service.updateTemplate(tenantId, templateId, {
        name: 'Updated Name',
      });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('removeTemplate', () => {
    it('should remove the template', async () => {
      templateRepo.findOne!.mockResolvedValue(mockTemplate);
      templateRepo.remove!.mockResolvedValue(mockTemplate);

      await service.removeTemplate(tenantId, templateId);
      expect(templateRepo.remove).toHaveBeenCalledWith(mockTemplate);
    });
  });

  describe('issueBadge', () => {
    it('should issue a badge to a student', async () => {
      templateRepo.findOne!.mockResolvedValue(mockTemplate);
      issuedRepo.findOne!.mockResolvedValue(null);
      issuedRepo.create!.mockReturnValue(mockIssued);
      issuedRepo.save!.mockResolvedValue(mockIssued);

      const result = await service.issueBadge(tenantId, {
        studentProfileId,
        badgeTemplateId: templateId,
      });
      expect(result).toEqual(mockIssued);
      expect(issuedRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if badge already issued', async () => {
      templateRepo.findOne!.mockResolvedValue(mockTemplate);
      issuedRepo.findOne!.mockResolvedValue(mockIssued);

      await expect(
        service.issueBadge(tenantId, {
          studentProfileId,
          badgeTemplateId: templateId,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllIssued', () => {
    it('should return paginated issued badges', async () => {
      issuedRepo.findAndCount!.mockResolvedValue([[mockIssued], 1]);

      const result = await service.findAllIssued(tenantId, {
        page: 1,
        limit: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findIssuedByStudent', () => {
    it('should return badges for a student', async () => {
      issuedRepo.find!.mockResolvedValue([mockIssued]);

      const result = await service.findIssuedByStudent(
        tenantId,
        studentProfileId,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('findOneIssued', () => {
    it('should return an issued badge', async () => {
      issuedRepo.findOne!.mockResolvedValue(mockIssued);
      const result = await service.findOneIssued(tenantId, issuedId);
      expect(result).toEqual(mockIssued);
    });

    it('should throw NotFoundException if not found', async () => {
      issuedRepo.findOne!.mockResolvedValue(null);
      await expect(
        service.findOneIssued(tenantId, 'missing'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyBadge', () => {
    it('should return badge by verification hash', async () => {
      issuedRepo.findOne!.mockResolvedValue(mockIssued);
      const result = await service.verifyBadge('abc123hash');
      expect(result).toEqual(mockIssued);
    });

    it('should return null if hash not found', async () => {
      issuedRepo.findOne!.mockResolvedValue(null);
      const result = await service.verifyBadge('invalid');
      expect(result).toBeNull();
    });
  });

  describe('revokeBadge', () => {
    it('should revoke a badge and set reason', async () => {
      const revoked = {
        ...mockIssued,
        status: BadgeStatus.REVOKED,
        revokedAt: new Date(),
        revocationReason: 'Cheating detected',
      };
      issuedRepo.findOne!.mockResolvedValue({ ...mockIssued });
      issuedRepo.save!.mockResolvedValue(revoked);

      const result = await service.revokeBadge(tenantId, issuedId, {
        reason: 'Cheating detected',
      });
      expect(result.status).toBe(BadgeStatus.REVOKED);
      expect(result.revocationReason).toBe('Cheating detected');
    });
  });
});
