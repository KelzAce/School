import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';

describe('SchoolsController', () => {
  let controller: SchoolsController;

  const createSchoolDto = {
    name: 'Sunrise Academy',
    email: 'info@sunrise.example',
    phone: '+1-555-0100',
    address: '123 Education Ave, Springfield',
    schoolType: 'secondary' as const,
    registrationNumber: 'SCH-2024-001',
    contactPerson: 'Dr. Jane Smith',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolsController],
      providers: [SchoolsService],
    }).compile();

    controller = module.get<SchoolsController>(SchoolsController);
  });

  describe('findAll', () => {
    it('should return all schools', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a single school by id', () => {
      const created = controller.create(createSchoolDto);
      const result = controller.findOne(created.id);
      expect(result.id).toBe(created.id);
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('sch-999')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new school', () => {
      const before = controller.findAll().length;
      const created = controller.create(createSchoolDto);
      expect(created).toHaveProperty('id');
      expect(created.name).toBe('Sunrise Academy');
      expect(controller.findAll().length).toBe(before + 1);
    });
  });

  describe('update', () => {
    it('should update and return the school', () => {
      const created = controller.create(createSchoolDto);
      const updated = controller.update(created.id, { address: '456 New Street' });
      expect(updated.address).toBe('456 New Street');
    });

    it('should throw NotFoundException when updating a non-existent school', () => {
      expect(() =>
        controller.update('sch-999', { name: 'Ghost School' }),
      ).toThrow(NotFoundException);
    });
  });
});
