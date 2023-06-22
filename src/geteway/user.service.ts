import { Injectable, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { RoomDto } from './dto';
import JwtVerify from 'src/function/verify/JwtVerify';

@Injectable()
export class UserGetewayService {
  private readonly logger = new Logger(UserGetewayService.name);
  public server: Server = null;

  connect(client: Socket) {
    const verify: any = JwtVerify(
      client.handshake.headers.authorization as string,
    );
    if (!verify) client.disconnect();
  }

  JoinRoom(body: RoomDto, client: Socket) {
    const verify: any = JwtVerify(
      client.handshake.headers.authorization as string,
    );
    if (!verify || verify.id !== body.roomId.replace('user/', ''))
      client.disconnect();
    client.join(body.roomId);
  }

  LeaveRoom(body: RoomDto, client: Socket) {
    client.leave(body.roomId);
  }
}
