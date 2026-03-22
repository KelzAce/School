import { Test, TestingModule } from '@nestjs/testing';
import { MicroCredentialsController } from './micro-credentials.controller';
import { MicroCredentialsService } from './micro-credentials.service';
import { CredentialStatus } from './entities/micro-credential.entity';

const tenantId = 'tenant-uuid-1';
const credentialId = 'cred-uuid-1';
const studentProfileId = 'student-uuid-1';

const mockService = {
  issue: jest.fn(),
  findAll: jest.fn(),
  findByStudent: jest.fn(),
  findOne: jest.fn(),
  verify: jest.fn(),
  revoke: jest.fn(),
};

describe('MicroCredentialsController', () => {
  let controller: MicroCredentialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MicroCredentialsController],
      providers: [
        { provide: MicroCredentialsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<MicroCredentialsController>(
      MicroCredentialsController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('issue', () => {
    it('should delegate to service.issue', async () => {
      const dto = {
        studentProfileId,
        code: 'MC-WELD-001',
        name: 'Welding Fundamentals',
      };
      const expected = { id: credentialId, ...dto };
      mockService.issue.mockResolvedValue(expected);

      const result = await controller.issue(tenantId, dto);
      expect(mockService.issue).toHaveBeenCalledWith(tenantId, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should delegate to service.findAll', async () => {
      const query = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(tenantId, query);
      expect(mockService.findAll).toHaveBeenCalledWith(tenantId, query);
      expect(result).toEqual(expected);
    });
  });

  describe('findByStudent', () => {
    it('should delegate to service.findByStudent', async () => {
      const expected = [{ id: credentialId }];
      mockService.findByStudent.mockResolvedValue(expected);

      const result = await controller.findByStudent(tenantId, studentProfileId);
      expect(mockService.findByStudent).toHaveBeenCalledWith(
        tenantId,
        studentProfileId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('verify', () => {
    it('should delegate to service.verify', async () => {
      const expected = { id: credentialId, verificationHash: 'hash123' };
      mockService.verify.mockResolvedValue(expected);

      const result = await controller.verify('hash123');
      expect(mockService.verify).toHaveBeenCalledWith('hash123');
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to service.findOne', async () => {
      const expected = { id: credentialId };
      mockService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(tenantId, credentialId);
      expect(mockService.findOne).toHaveBeenCalledWith(tenantId, credentialId);
      expect(result).toEqual(expected);
    });
  });

  describe('revoke', () => {
    it('should delegate to service.revoke', async () => {
      const dto = { reason: 'Expired program' };
      const expected = {
        id: credentialId,
        status: CredentialStatus.REVOKED,
        revocationReason: 'Expired program',
      };
      mockService.revoke.mockResolvedValue(expected);

      const result = await controller.revoke(tenantId, credentialId, dto);
      expect(mockService.revoke).toHaveBeenCalledWith(
        tenantId,
        credentialId,
        dto,
      );
      expect(result).toEqual(expected);
    });
  });
});
