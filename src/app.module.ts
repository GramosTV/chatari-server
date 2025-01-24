import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotService } from './bot/bot.service';
import { BotModule } from './bot/bot.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [BotModule, ChatModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, BotService],
})
export class AppModule {}
