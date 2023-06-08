import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomDto } from './dto';
import { UserGetewayService } from './user.service';

@WebSocketGateway({ namespace: 'usergeteway' })
export class UserGeteway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(UserGeteway.name);
  constructor(private getewayService: UserGetewayService) {}

  @WebSocketServer() public server: Server;

  afterInit(server: Server) {
    this.getewayService.server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(client.id + ' was connected');
    this.getewayService.connect(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(client.id + ' was disconnect');
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
  JoinToRoom(@MessageBody() body: RoomDto, @ConnectedSocket() client: Socket) {
    this.getewayService.JoinRoom(body, client);
  }

  @SubscribeMessage('LeaveRoom')
  LeaveToRoom(@MessageBody() body: RoomDto, @ConnectedSocket() client: Socket) {
    this.getewayService.LeaveRoom(body, client);
  }
}
