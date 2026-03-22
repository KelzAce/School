import { Test, TestingModule } from '@nestjs/testing';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { BadgeLevel } from './entities/badge-template.entity';
import { BadgeStatus } from './entities/issued-badge.entity';

const tenantId = 'tenant-uuid-1';
const templateId = 'template-uuid-1';
const issuedId = 'issued-uuid-1';
const studentProfileId = 'student-uuid-1';

const mockService = {
  createTemplate: jest.fn(),
  findAllTemplates: jest.fn(),
  findOneTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  removeTemplate: jest.fn(),
  issueBadge: jest.fn(),
  findAllIssued: jest.fn(),
  findIssuedByStudent: jest.fn(),
  findOneIssued: jest.fn(),
  verifyBadge: jest.fn(),
  revokeBadge: jest.fn(),
};

describe('BadgesController', () => {
  let controller: BadgesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgesController],
      providers: [{ provide: BadgesService, useValue: mockService }],
    }).compile();

    controller = module.get<BadgesController>(BadgesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTemplate', () => {
    it('should delegate to service.createTemplate', async () => {
      const dto = { code: 'WELD-BASIC', name: 'Basic Welding' };
      const expected = { id: templateId, ...dto };
      mockService.createTemplate.mockResolvedValue(expected);

      const result = await controller.createTemplate(tenantId, dto);
      expect(mockService.createTemplate).toHaveBeenCalledWith(tenantId, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAllTemplates', () => {
    it('should delegate to service.findAllTemplates', async () => {
      const query = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockService.findAllTemplates.mockResolvedValue(expected);

      const result = await controller.findAllTemplates(tenantId, query);
      expect(mockService.findAllTemplates).toHaveBeenCalledWith(
        tenantId,
        query,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findOneTemplate', () => {
    it('should delegate to service.findOneTemplate', async () => {
      const expected = { id: templateId };
      mockService.findOneTemplate.mockResolvedValue(expected);

      const result = await controller.findOneTemplate(tenantId, templateId);
      expect(mockService.findOneTemplate).toHaveBeenCalledWith(
        tenantId,
        templateId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateTemplate', () => {
    it('should delegate to service.updateTemplate', async () => {
      const dto = { name: 'Updated' };
      const expected = { id: templateId, name: 'Updated' };
      mockService.updateTemplate.mockResolvedValue(expected);

      const result = await controller.updateTemplate(tenantId, templateId, dto);
      expect(mockService.updateTemplate).toHaveBeenCalledWith(
        tenantId,
        templateId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('removeTemplate', () => {
    it('should delegate to service.removeTemplate', async () => {
      mockService.removeTemplate.mockResolvedValue(undefined);

      await controller.removeTemplate(tenantId, templateId);
      expect(mockService.removeTemplate).toHaveBeenCalledWith(
        tenantId,
        templateId,
      );
    });
  });

  describe('issueBadge', () => {
    it('should delegate to service.issueBadge', async () => {
      const dto = { studentProfileId, badgeTemplateId: templateId };
      const expected = { id: issuedId, ...dto };
      mockService.issueBadge.mockResolvedValue(expected);

      const result = await controller.issueBadge(tenantId, dto);
      expect(mockService.issueBadge).toHaveBeenCalledWith(tenantId, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAllIssued', () => {
    it('should delegate to service.findAllIssued', async () => {
      const query = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockService.findAllIssued.mockResolvedValue(expected);

      const result = await controller.findAllIssued(tenantId, query);
      expect(mockService.findAllIssued).toHaveBeenCalledWith(tenantId, query);
      expect(result).toEqual(expected);
    });
  });

  describe('findIssuedByStudent', () => {
    it('should delegate to service.findIssuedByStudent', async () => {
      const expected = [{ id: issuedId }];
      mockService.findIssuedByStudent.mockResolvedValue(expected);

      const result = await controller.findIssuedByStudent(
        tenantId,
        studentProfileId,
      );
      expect(mockService.findIssuedByStudent).toHaveBeenCalledWith(
        tenantId,
        studentProfileId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findOneIssued', () => {
    it('should delegate to service.findOneIssued', async () => {
      const expected = { id: issuedId };
      mockService.findOneIssued.mockResolvedValue(expected);

      const result = await controller.findOneIssued(tenantId, issuedId);
      expect(mockService.findOneIssued).toHaveBeenCalledWith(
        tenantId,
        issuedId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('verifyBadge', () => {
    it('should delegate to service.verifyBadge', async () => {
      const expected = { id: issuedId, verificationHash: 'abc' };
      mockService.verifyBadge.mockResolvedValue(expected);

      const result = await controller.verifyBadge('abc');
      expect(mockService.verifyBadge).toHaveBeenCalledWith('abc');
      expect(result).toEqual(expected);
    });
  });

  describe('revokeBadge', () => {
    it('should delegate to service.revokeBadge', async () => {
      const dto = { reason: 'Fraud' };
      const expected = {
        id: issuedId,
        status: BadgeStatus.REVOKED,
        revocationReason: 'Fraud',
      };
      mockService.revokeBadge.mockResolvedValue(expected);

      const result = await controller.revokeBadge(tenantId, issuedId, dto);
      expect(mockService.revokeBadge).toHaveBeenCalledWith(
        tenantId,
        issuedId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });
});
