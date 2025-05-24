// src/modules/openai/chat.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatService, ChatMessage } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // GET /api/chat — hardkodirani "health-check" odgovor
   @Get()
  async healthCheck(@Query('prompt') prompt?: string) {
    if (!prompt) {
      return { message: 'Chat API is up and running!' };
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: prompt },
    ];

    try {
      const reply = await this.chatService.sendMessage(messages);
      return { message: reply.content };
    } catch (err: any) {
      // Isprintaj error u konzolu za debug
      console.error('OpenAI error in healthCheck:', err);
      // Vraćamo informaciju o grešci, ali ne rušimo server
      return {
        error: true,
        message: err.message || 'Nešto je pošlo po krivu s OpenAI API-jem',
      };
    }
  }

  // POST /api/chat — pravi chat poziv
  @Post()
  async chat(@Body() body: { messages: ChatMessage[] }) {
    const reply = await this.chatService.sendMessage(body.messages);
    return { message: reply };
  }
}
