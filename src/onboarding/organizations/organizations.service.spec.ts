import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  const createOrganizationDto = {
    name: 'TechCorp Learning Solutions',
    email: 'training@techcorp.example',
    phone: '+1-555-0300',
    address: '789 Corporate Blvd, Tech City',
    industry: 'Technology',
    registrationNumber: 'ORG-2024-001',
    contactPerson: 'Alice Manager',
    size: 'large' as const,
    website: 'https://techcorp.example',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationsService],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  describe('findAll', () => {
    it('should return an empty array initially', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return organizations with required fields after creation', () => {
      service.create(createOrganizationDto);
      const result = service.findAll();
      expect(result.length).toBe(1);
      result.forEach((org) => {
        expect(org).toHaveProperty('id');
        expect(org).toHaveProperty('name');
        expect(org).toHaveProperty('email');
        expect(org).toHaveProperty('phone');
        expect(org).toHaveProperty('address');
        expect(org).toHaveProperty('industry');
        expect(org).toHaveProperty('registrationNumber');
        expect(org).toHaveProperty('contactPerson');
        expect(org).toHaveProperty('size');
        expect(org).toHaveProperty('onboardedAt');
      });
    });
  });

  describe('findOne', () => {
    it('should return the correct organization for a valid id', () => {
      const created = service.create(createOrganizationDto);
      const result = service.findOne(created.id);
      expect(result).toBeDefined();
      expect(result!.id).toBe(created.id);
      expect(result!.name).toBe('TechCorp Learning Solutions');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('org-999');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new organization and return it', () => {
      const before = service.findAll().length;
      const created = service.create(createOrganizationDto);
      expect(created).toHaveProperty('id');
      expect(created.id).toMatch(/^org-/);
      expect(created.name).toBe('TechCorp Learning Solutions');
      expect(created).toHaveProperty('onboardedAt');
      expect(service.findAll().length).toBe(before + 1);
    });

    it('should auto-increment organization ids', () => {
      const first = service.create(createOrganizationDto);
      const second = service.create({ ...createOrganizationDto, name: 'Second Corp' });
      expect(first.id).toBe('org-001');
      expect(second.id).toBe('org-002');
    });
  });

  describe('update', () => {
    it('should update an existing organization and return the updated record', () => {
      const created = service.create(createOrganizationDto);
      const updated = service.update(created.id, { size: 'enterprise' });
      expect(updated).toBeDefined();
      expect(updated!.size).toBe('enterprise');
    });

    it('should return undefined when updating a non-existent organization', () => {
      const updated = service.update('org-999', { name: 'Ghost Corp' });
      expect(updated).toBeUndefined();
    });
  });
});
