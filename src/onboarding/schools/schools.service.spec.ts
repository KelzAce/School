import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsService } from './schools.service';

describe('SchoolsService', () => {
  let service: SchoolsService;

  const createSchoolDto = {
    name: 'Sunrise Academy',
    email: 'info@sunrise.example',
    phone: '+1-555-0100',
    address: '123 Education Ave, Springfield',
    schoolType: 'secondary' as const,
    registrationNumber: 'SCH-2024-001',
    contactPerson: 'Dr. Jane Smith',
    website: 'https://sunrise.example',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolsService],
    }).compile();

    service = module.get<SchoolsService>(SchoolsService);
  });

  describe('findAll', () => {
    it('should return an empty array initially', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return schools with required fields after creation', () => {
      service.create(createSchoolDto);
      const result = service.findAll();
      expect(result.length).toBe(1);
      result.forEach((school) => {
        expect(school).toHaveProperty('id');
        expect(school).toHaveProperty('name');
        expect(school).toHaveProperty('email');
        expect(school).toHaveProperty('phone');
        expect(school).toHaveProperty('address');
        expect(school).toHaveProperty('schoolType');
        expect(school).toHaveProperty('registrationNumber');
        expect(school).toHaveProperty('contactPerson');
        expect(school).toHaveProperty('onboardedAt');
      });
    });
  });

  describe('findOne', () => {
    it('should return the correct school for a valid id', () => {
      const created = service.create(createSchoolDto);
      const result = service.findOne(created.id);
      expect(result).toBeDefined();
      expect(result!.id).toBe(created.id);
      expect(result!.name).toBe('Sunrise Academy');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('sch-999');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new school and return it', () => {
      const before = service.findAll().length;
      const created = service.create(createSchoolDto);
      expect(created).toHaveProperty('id');
      expect(created.id).toMatch(/^sch-/);
      expect(created.name).toBe('Sunrise Academy');
      expect(created).toHaveProperty('onboardedAt');
      expect(service.findAll().length).toBe(before + 1);
    });

    it('should auto-increment school ids', () => {
      const first = service.create(createSchoolDto);
      const second = service.create({ ...createSchoolDto, name: 'Second School' });
      expect(first.id).toBe('sch-001');
      expect(second.id).toBe('sch-002');
    });
  });

  describe('update', () => {
    it('should update an existing school and return the updated record', () => {
      const created = service.create(createSchoolDto);
      const updated = service.update(created.id, { name: 'Updated Academy' });
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Academy');
    });

    it('should return undefined when updating a non-existent school', () => {
      const updated = service.update('sch-999', { name: 'Ghost School' });
      expect(updated).toBeUndefined();
    });
  });
});
