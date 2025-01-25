import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(socket: Socket) {
    console.log('A user connected:', socket.id);
    this.chatService.addUser(socket.id, this.server);
  }

  handleDisconnect(socket: Socket) {
    console.log('A user disconnected:', socket.id);
    this.chatService.removeUser(socket.id, this.server);
  }

  @SubscribeMessage('connectUser')
  async handleUserConnection(@ConnectedSocket() socket: Socket) {
    this.chatService.pairUser(socket.id, this.server);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { message: string; isBot: boolean },
    @ConnectedSocket() socket: Socket,
  ) {
    await this.chatService.sendMessage(
      socket.id,
      data.message,
      data.isBot,
      this.server,
    );
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@ConnectedSocket() socket: Socket) {
    this.chatService.leaveRoom(socket.id, this.server);
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() socket: Socket) {
    this.chatService.handleTyping(socket.id, this.server);
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(@ConnectedSocket() socket: Socket) {
    this.chatService.handleStopTyping(socket.id, this.server);
  }
}
