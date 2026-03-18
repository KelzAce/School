import { Test, TestingModule } from '@nestjs/testing';
import { IndividualsService } from './individuals.service';

describe('IndividualsService', () => {
  let service: IndividualsService;

  const createIndividualDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0200',
    dateOfBirth: '1995-06-15',
    role: 'teacher' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndividualsService],
    }).compile();

    service = module.get<IndividualsService>(IndividualsService);
  });

  describe('findAll', () => {
    it('should return an empty array initially', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return individuals with required fields after creation', () => {
      service.create(createIndividualDto);
      const result = service.findAll();
      expect(result.length).toBe(1);
      result.forEach((individual) => {
        expect(individual).toHaveProperty('id');
        expect(individual).toHaveProperty('firstName');
        expect(individual).toHaveProperty('lastName');
        expect(individual).toHaveProperty('email');
        expect(individual).toHaveProperty('phone');
        expect(individual).toHaveProperty('dateOfBirth');
        expect(individual).toHaveProperty('role');
        expect(individual).toHaveProperty('onboardedAt');
      });
    });
  });

  describe('findOne', () => {
    it('should return the correct individual for a valid id', () => {
      const created = service.create(createIndividualDto);
      const result = service.findOne(created.id);
      expect(result).toBeDefined();
      expect(result!.id).toBe(created.id);
      expect(result!.firstName).toBe('John');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('ind-999');
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new individual and return it', () => {
      const before = service.findAll().length;
      const created = service.create(createIndividualDto);
      expect(created).toHaveProperty('id');
      expect(created.id).toMatch(/^ind-/);
      expect(created.firstName).toBe('John');
      expect(created).toHaveProperty('onboardedAt');
      expect(service.findAll().length).toBe(before + 1);
    });

    it('should auto-increment individual ids', () => {
      const first = service.create(createIndividualDto);
      const second = service.create({ ...createIndividualDto, email: 'jane@example.com' });
      expect(first.id).toBe('ind-001');
      expect(second.id).toBe('ind-002');
    });
  });

  describe('update', () => {
    it('should update an existing individual and return the updated record', () => {
      const created = service.create(createIndividualDto);
      const updated = service.update(created.id, { role: 'tutor' });
      expect(updated).toBeDefined();
      expect(updated!.role).toBe('tutor');
    });

    it('should return undefined when updating a non-existent individual', () => {
      const updated = service.update('ind-999', { role: 'parent' });
      expect(updated).toBeUndefined();
    });
  });
});
