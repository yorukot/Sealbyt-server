import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { RoomDto } from './dto';
import JwtVerify from 'src/function/verify/JwtVerify';

@Injectable()
export class UserGetewayService {
  public server: Server = null;

  connect(client: Socket) {
    console.log(client.handshake.query.authorization);
    const verify: any = JwtVerify(client.handshake.query.accessToken as string);
    if (!verify) client.disconnect();
  }

  JoinRoom(body: RoomDto, client: Socket) {
    const verify: any = JwtVerify(client.handshake.query.accessToken as string);
    if (!verify || verify.id !== body.roomId.replace('user/', ''))
      client.disconnect();
    client.join(body.roomId);
  }

  LeaveRoom(body: RoomDto, client: Socket) {
    client.leave(body.roomId);
  }
}
