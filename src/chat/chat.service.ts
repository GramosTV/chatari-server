import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
@Injectable()
export class ChatService {
  private activeUsers: Set<string> = new Set();
  private waitingUsers: Set<string> = new Set();
  private userRoomMap: Map<string, string> = new Map();

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
        .emit('waitingForUser', { message: 'Waiting for another user.' });
    }
  }

  sendMessage(userId: string, message: string, server: Server) {
    const roomId = this.userRoomMap.get(userId);
    this.userRoomMap.forEach((value, key) => {
      if (value === roomId) {
        server.to(key).emit('newMessage', { message });
      }
    });
  }
}
