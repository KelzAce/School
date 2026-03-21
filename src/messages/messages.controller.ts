import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  MessagesService,
  Message,
  CreateMessageDto,
} from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(@Query('toId') toId?: string): Message[] {
    if (toId) {
      return this.messagesService.findByRecipient(toId);
    }
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Message {
    const message = this.messagesService.findOne(id);
    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }
    return message;
  }

  @Post()
  create(@Body() dto: CreateMessageDto): Message {
    return this.messagesService.create(dto);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string): Message {
    const message = this.messagesService.markRead(id);
    if (!message) {
      throw new NotFoundException(`Message with id "${id}" not found`);
    }
    return message;
  }
}
