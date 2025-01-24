import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [BotModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
