import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesService],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  describe('findAll', () => {
    it('should return an array of messages', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return messages with the required fields', () => {
      const result = service.findAll();
      result.forEach((msg) => {
        expect(msg).toHaveProperty('id');
        expect(msg).toHaveProperty('fromId');
        expect(msg).toHaveProperty('fromRole');
        expect(msg).toHaveProperty('toId');
        expect(msg).toHaveProperty('toRole');
        expect(msg).toHaveProperty('subject');
        expect(msg).toHaveProperty('body');
        expect(msg).toHaveProperty('sentAt');
        expect(msg).toHaveProperty('read');
        expect(['student', 'teacher', 'parent', 'admin']).toContain(
          msg.fromRole,
        );
      });
    });
  });

  describe('findOne', () => {
    it('should return the correct message for a valid id', () => {
      const result = service.findOne('msg-001');
      expect(result).toBeDefined();
      expect(result!.id).toBe('msg-001');
    });

    it('should return undefined for an unknown id', () => {
      const result = service.findOne('msg-999');
      expect(result).toBeUndefined();
    });
  });

  describe('findByRecipient', () => {
    it('should return only messages addressed to the given recipient', () => {
      const result = service.findByRecipient('st-001');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((msg) => expect(msg.toId).toBe('st-001'));
    });
  });

  describe('create', () => {
    it('should create a new message with read=false', () => {
      const before = service.findAll().length;
      const created = service.create({
        fromId: 'admin-001',
        fromRole: 'admin',
        toId: 'teacher-001',
        toRole: 'teacher',
        subject: 'Schedule update',
        body: 'Please review the updated timetable.',
      });
      expect(created).toHaveProperty('id');
      expect(created.read).toBe(false);
      expect(service.findAll().length).toBe(before + 1);
    });
  });

  describe('markRead', () => {
    it('should mark a message as read', () => {
      const updated = service.markRead('msg-002');
      expect(updated).toBeDefined();
      expect(updated!.read).toBe(true);
    });

    it('should return undefined for an unknown message id', () => {
      const updated = service.markRead('msg-999');
      expect(updated).toBeUndefined();
    });
  });
});
