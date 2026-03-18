import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  const createOrganizationDto = {
    name: 'TechCorp Learning Solutions',
    email: 'training@techcorp.example',
    phone: '+1-555-0300',
    address: '789 Corporate Blvd, Tech City',
    industry: 'Technology',
    registrationNumber: 'ORG-2024-001',
    contactPerson: 'Alice Manager',
    size: 'large' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [OrganizationsService],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  describe('findAll', () => {
    it('should return all organizations', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a single organization by id', () => {
      const created = controller.create(createOrganizationDto);
      const result = controller.findOne(created.id);
      expect(result.id).toBe(created.id);
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('org-999')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new organization', () => {
      const before = controller.findAll().length;
      const created = controller.create(createOrganizationDto);
      expect(created).toHaveProperty('id');
      expect(created.name).toBe('TechCorp Learning Solutions');
      expect(controller.findAll().length).toBe(before + 1);
    });
  });

  describe('update', () => {
    it('should update and return the organization', () => {
      const created = controller.create(createOrganizationDto);
      const updated = controller.update(created.id, { industry: 'Finance' });
      expect(updated.industry).toBe('Finance');
    });

    it('should throw NotFoundException when updating a non-existent organization', () => {
      expect(() =>
        controller.update('org-999', { name: 'Ghost Corp' }),
      ).toThrow(NotFoundException);
    });
  });
});
