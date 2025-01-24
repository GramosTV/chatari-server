import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { BotService } from 'src/bot/bot.service';
@Injectable()
export class ChatService {
  private activeUsers: Set<string> = new Set();
  private waitingUsers: Set<string> = new Set();
  private userRoomMap: Map<string, string> = new Map();
  constructor(private botService: BotService) {}

  addUser(userId: string, server: Server) {
    this.activeUsers.add(userId);
    server.emit('activeUsers', { count: this.activeUsers.size });
  }

  removeUser(userId: string, server: Server) {
    this.activeUsers.delete(userId);
    this.removeWaitingUser(userId, server);
    this.eradicateRoom(userId, server);
  }

  addWaitingUser(userId: string, server: Server) {
    this.waitingUsers.add(userId);
    server.emit('waitingUsers', { count: this.waitingUsers.size });
  }

  removeWaitingUser(userId: string, server: Server) {
    this.waitingUsers.delete(userId);
    server.emit('waitingUsers', { count: this.waitingUsers.size });
  }

  eradicateRoom(userId: string, server: Server) {
    const roomId = this.userRoomMap.get(userId);
    if (roomId) {
      this.userRoomMap.forEach((value, key) => {
        if (value === roomId) {
          this.userRoomMap.delete(key);
          server.to(key).emit('chatEnded', { message: 'Room eradicated.' });
        }
      });
    }
  }

  getRoomByUserId(userId: string): string | null {
    return this.userRoomMap.get(userId) || null;
  }

  pairUser(userId: string, server: Server) {
    this.addWaitingUser(userId, server);
    if (this.waitingUsers.size >= 2) {
      const user1 = userId;
      const iterator = this.waitingUsers.values();
      const user2 = iterator.next().value;

      const roomId = `${user1}-${user2}`;
      this.userRoomMap.set(user1, roomId);
      this.userRoomMap.set(user2, roomId);

      this.removeWaitingUser(user1, server);
      this.removeWaitingUser(user2, server);

      server.to(user1).emit('chatStarted', { message: 'Chat started.' });
      server.to(user2).emit('chatStarted', { message: 'Chat started.' });
    } else {
      server
        .to(userId)
        .emit('waitingForUser', { message: 'Hold tight! Waiting for a user.' });
    }
  }

  async sendMessage(
    userId: string,
    message: string,
    isBot: boolean,
    server: Server,
  ) {
    if (isBot) {
      const botReply = await this.botService.getResponse(message);
      server
        .to(userId)
        .emit('newMessage', { message: botReply, sender: 'Bot' });
      return;
    }
    const roomId = this.userRoomMap.get(userId);
    this.userRoomMap.forEach((value, key) => {
      if (value === roomId && key !== userId) {
        server.to(key).emit('newMessage', { message, sender: 'User' });
      }
    });
  }
}
