import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IndividualsController } from './individuals.controller';
import { IndividualsService } from './individuals.service';

describe('IndividualsController', () => {
  let controller: IndividualsController;

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
      controllers: [IndividualsController],
      providers: [IndividualsService],
    }).compile();

    controller = module.get<IndividualsController>(IndividualsController);
  });

  describe('findAll', () => {
    it('should return all individuals', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a single individual by id', () => {
      const created = controller.create(createIndividualDto);
      const result = controller.findOne(created.id);
      expect(result.id).toBe(created.id);
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('ind-999')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new individual', () => {
      const before = controller.findAll().length;
      const created = controller.create(createIndividualDto);
      expect(created).toHaveProperty('id');
      expect(created.firstName).toBe('John');
      expect(controller.findAll().length).toBe(before + 1);
    });
  });

  describe('update', () => {
    it('should update and return the individual', () => {
      const created = controller.create(createIndividualDto);
      const updated = controller.update(created.id, { role: 'student' });
      expect(updated.role).toBe('student');
    });

    it('should throw NotFoundException when updating a non-existent individual', () => {
      expect(() =>
        controller.update('ind-999', { role: 'parent' }),
      ).toThrow(NotFoundException);
    });
  });
});
