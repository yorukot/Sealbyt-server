import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
// import JwtVerify from 'src/function/verify/JwtVerify';
import { MessageRoomDto, SendMessageToRoomDto } from './dto';
import JwtRoomVerifyToken from 'src/function/verify/JwtRoomVerify';

@Injectable()
export class GetewayService {
  connect(socket: Socket) {
    /* console.log(socket.handshake.headers.authorization);
    const verify = JwtVerify(socket.handshake.headers.authorization);
    console.log(verify);
    if (!verify) socket.disconnect();*/
    console.log(socket.id);
    console.log('connected');
  }

  JoinRoom(body: MessageRoomDto, client: Socket) {
    const verify = this.JwtVerifyToken(
      client.handshake.headers.authorization,
      body.roomId,
      client,
    );
    if (!verify) return;
    client.join(body.roomId);
  }

  LeaveRoom(body: MessageRoomDto, client: Socket) {
    client.leave(body.roomId);
  }

  SendMessage(server: Server, body: SendMessageToRoomDto, client: Socket) {
    const verify = this.JwtVerifyToken(
      client.handshake.headers.authorization,
      body.roomId,
      client,
    );
    if (!verify) return;
    server.to(body.roomId).emit('NewMessageWasSend', body.content);
  }

  JwtVerifyToken(
    authorizationToken: string,
    roomId: string = null,
    client: Socket,
  ) {
    const Verify = JwtRoomVerifyToken(authorizationToken, roomId);
    if (!Verify) {
      client.emit('Unauthorized', 'You are not authorized to do that.');
      return false;
    }
    return true;
  }
}
