import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [MessagesService],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    service = module.get<MessagesService>(MessagesService);
  });

  describe('findAll', () => {
    it('should return all messages when no filter is provided', () => {
      const result = controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(service.findAll().length);
    });

    it('should return filtered messages when toId is provided', () => {
      const result = controller.findAll('st-001');
      result.forEach((msg) => expect(msg.toId).toBe('st-001'));
    });
  });

  describe('findOne', () => {
    it('should return a single message by id', () => {
      const result = controller.findOne('msg-001');
      expect(result.id).toBe('msg-001');
    });

    it('should throw NotFoundException for an unknown id', () => {
      expect(() => controller.findOne('msg-999')).toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new message', () => {
      const before = controller.findAll().length;
      const created = controller.create({
        fromId: 'st-001',
        fromRole: 'student',
        toId: 'teacher-001',
        toRole: 'teacher',
        subject: 'Question about assignment',
        body: 'Can you clarify the requirements?',
      });
      expect(created).toHaveProperty('id');
      expect(created.read).toBe(false);
      expect(controller.findAll().length).toBe(before + 1);
    });
  });

  describe('markRead', () => {
    it('should mark a message as read', () => {
      const updated = controller.markRead('msg-003');
      expect(updated.read).toBe(true);
    });

    it('should throw NotFoundException for an unknown message id', () => {
      expect(() => controller.markRead('msg-999')).toThrow(NotFoundException);
    });
  });
});
