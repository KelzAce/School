import { Injectable } from '@nestjs/common';

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface Message {
  id: string;
  fromId: string;
  fromRole: UserRole;
  toId: string;
  toRole: UserRole;
  subject: string;
  body: string;
  sentAt: string;
  read: boolean;
}

export interface CreateMessageDto {
  fromId: string;
  fromRole: UserRole;
  toId: string;
  toRole: UserRole;
  subject: string;
  body: string;
}

@Injectable()
export class MessagesService {
  private readonly messages: Message[] = [
    {
      id: 'msg-001',
      fromId: 'teacher-001',
      fromRole: 'teacher',
      toId: 'st-001',
      toRole: 'student',
      subject: 'Great progress on Python Module 1!',
      body: 'Hi Alice, just wanted to let you know your micro-assessment result was outstanding. Keep up the excellent work!',
      sentAt: '2025-01-15T12:00:00Z',
      read: true,
    },
    {
      id: 'msg-002',
      fromId: 'teacher-001',
      fromRole: 'teacher',
      toId: 'parent-001',
      toRole: 'parent',
      subject: "Weekly update: Alice's progress",
      body: "Alice is performing exceptionally well in her STEM track. She has mastered variables and data types and is now working through control flow.",
      sentAt: '2025-01-19T09:00:00Z',
      read: false,
    },
    {
      id: 'msg-003',
      fromId: 'parent-002',
      fromRole: 'parent',
      toId: 'teacher-001',
      toRole: 'teacher',
      subject: "Question about Marcus's upcoming live session",
      body: 'Hi, Marcus mentioned he has a live arts session booked for next week. Can you confirm the details and what he should prepare?',
      sentAt: '2025-01-18T17:30:00Z',
      read: false,
    },
  ];

  private nextIdCounter = 4;

  findAll(): Message[] {
    return this.messages;
  }

  findOne(id: string): Message | undefined {
    return this.messages.find((m) => m.id === id);
  }

  findByRecipient(toId: string): Message[] {
    return this.messages.filter((m) => m.toId === toId);
  }

  create(dto: CreateMessageDto): Message {
    const message: Message = {
      id: `msg-${String(this.nextIdCounter++).padStart(3, '0')}`,
      ...dto,
      sentAt: new Date().toISOString(),
      read: false,
    };
    this.messages.push(message);
    return message;
  }

  markRead(id: string): Message | undefined {
    const message = this.findOne(id);
    if (!message) return undefined;
    message.read = true;
    return message;
  }
}
