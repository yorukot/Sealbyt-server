import { OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageRoomDto, SendMessageToRoomDto } from './dto';
import { GetewayService } from './geteway.service';

@WebSocketGateway({ namespace: 'sendmessage' })
export class SendMessageGateway implements OnModuleInit {
  constructor(private getewayService: GetewayService) {}

  @WebSocketServer()
  server: Server;
  onModuleInit() {
    this.server.on('connection', async (socket) => {
      this.getewayService.connect(socket);
    });
  }

  @SubscribeMessage('newMessage')
  handleMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }

  @SubscribeMessage('JoinRoom')
  JoinToRoom(
    @MessageBody() body: MessageRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.getewayService.JoinRoom(body, client);
  }

  @SubscribeMessage('LeaveRoom')
  LeaveToRoom(
    @MessageBody() body: MessageRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.getewayService.LeaveRoom(body, client);
  }

  @SubscribeMessage('sendMessage')
  SendMessage(
    @MessageBody() body: SendMessageToRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.getewayService.SendMessage(this.server, body, client);
  }
}
