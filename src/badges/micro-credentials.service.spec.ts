import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MicroCredentialsService } from './micro-credentials.service';
import {
  MicroCredential,
  CredentialStatus,
} from './entities/micro-credential.entity';

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
const credentialId = 'cred-uuid-1';
const studentProfileId = 'student-uuid-1';

const mockCredential: Partial<MicroCredential> = {
  id: credentialId,
  tenantId,
  studentProfileId,
  code: 'MC-WELD-001',
  name: 'Welding Fundamentals',
  description: 'Micro-credential for welding basics',
  status: CredentialStatus.ACTIVE,
  verificationHash: 'def789hash',
  badgeIds: ['badge-1'],
  skillIds: ['skill-1'],
  issuedAt: new Date(),
  tenant: null as any,
  studentProfile: null as any,
  issuerName: null,
  issuerUrl: null,
  creditHours: null,
  verificationUrl: null,
  expiresAt: null,
  revokedAt: null,
  revocationReason: null,
  issuedBy: null,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('MicroCredentialsService', () => {
  let service: MicroCredentialsService;
  let credentialRepo: MockRepository<MicroCredential>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MicroCredentialsService,
        {
          provide: getRepositoryToken(MicroCredential),
          useValue: createMockRepository<MicroCredential>(),
        },
      ],
    }).compile();

    service = module.get<MicroCredentialsService>(MicroCredentialsService);
    credentialRepo = module.get(getRepositoryToken(MicroCredential));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('issue', () => {
    it('should issue a micro-credential', async () => {
      credentialRepo.findOne!.mockResolvedValue(null);
      credentialRepo.create!.mockReturnValue(mockCredential);
      credentialRepo.save!.mockResolvedValue(mockCredential);

      const result = await service.issue(tenantId, {
        studentProfileId,
        code: 'MC-WELD-001',
        name: 'Welding Fundamentals',
        badgeIds: ['badge-1'],
        skillIds: ['skill-1'],
      });
      expect(result).toEqual(mockCredential);
      expect(credentialRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate code', async () => {
      credentialRepo.findOne!.mockResolvedValue(mockCredential);

      await expect(
        service.issue(tenantId, {
          studentProfileId,
          code: 'MC-WELD-001',
          name: 'Welding Fundamentals',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated credentials', async () => {
      credentialRepo.findAndCount!.mockResolvedValue([[mockCredential], 1]);

      const result = await service.findAll(tenantId, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a micro-credential', async () => {
      credentialRepo.findOne!.mockResolvedValue(mockCredential);
      const result = await service.findOne(tenantId, credentialId);
      expect(result).toEqual(mockCredential);
    });

    it('should throw NotFoundException if not found', async () => {
      credentialRepo.findOne!.mockResolvedValue(null);
      await expect(service.findOne(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByStudent', () => {
    it('should return active credentials for a student', async () => {
      credentialRepo.find!.mockResolvedValue([mockCredential]);
      const result = await service.findByStudent(tenantId, studentProfileId);
      expect(result).toHaveLength(1);
    });
  });

  describe('verify', () => {
    it('should return credential by hash', async () => {
      credentialRepo.findOne!.mockResolvedValue(mockCredential);
      const result = await service.verify('def789hash');
      expect(result).toEqual(mockCredential);
    });

    it('should return null if hash not found', async () => {
      credentialRepo.findOne!.mockResolvedValue(null);
      const result = await service.verify('invalid');
      expect(result).toBeNull();
    });
  });

  describe('revoke', () => {
    it('should revoke a credential and set reason', async () => {
      const revoked = {
        ...mockCredential,
        status: CredentialStatus.REVOKED,
        revokedAt: new Date(),
        revocationReason: 'Academic dishonesty',
      };
      credentialRepo.findOne!.mockResolvedValue({ ...mockCredential });
      credentialRepo.save!.mockResolvedValue(revoked);

      const result = await service.revoke(tenantId, credentialId, {
        reason: 'Academic dishonesty',
      });
      expect(result.status).toBe(CredentialStatus.REVOKED);
      expect(result.revocationReason).toBe('Academic dishonesty');
    });
  });
});
