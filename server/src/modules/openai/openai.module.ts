import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [],
  providers: [ChatService, ConfigService],
  controllers: [ChatController],
})
export class OpenAiModule {}
