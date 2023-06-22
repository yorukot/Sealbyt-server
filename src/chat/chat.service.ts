import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateChatRoomDto } from './dto';
import CreateRoomData from 'src/DataBase/function/Create/chatroom/createChatRoom';
import generateRoomId from 'src/function/generate/GenerateRoomid';
import CreateChatParticipant from 'src/DataBase/function/Create/chatroom/createChatparticipant';
import FindRelationshipByBothId from 'src/DataBase/function/Find/relationship/FindByBothId';

@Injectable()
export class ChatService {
  async CreateRoom(res: Response, create_room_dto: CreateChatRoomDto) {
    //查看第一次加入人員是否過多
    if (create_room_dto.users.length > 20) {
      throw new ForbiddenException(
        'Adding too many members at once is not supported when creating a room',
      );
    }
    //查看他是否有權限邀請他一起
    create_room_dto.users.forEach(async (user_data) => {
      const create_participant_data = await FindRelationshipByBothId(
        create_room_dto.sender_user_id,
        user_data,
      );
      if (!create_participant_data || create_participant_data.status !== 0)
        throw new UnauthorizedException(
          `You are not authorized to invite this user(${user_data}) to create a room`,
        );
    });
    //創建房間
    const room_id = generateRoomId();
    const create_room_data = await CreateRoomData(
      room_id,
      create_room_dto.room_name,
      create_room_dto.room_type,
    );
    //如果沒有成功創建房間
    if (!create_room_data)
      throw new InternalServerErrorException(
        'An unidentified error occurred when attempting to create the room',
      );
    //創建所有成員與房間的關係
    const permissions = create_room_dto.room_type === 0 ? 0 : 1;
    create_room_dto.users.forEach(async (user_data) => {
      const create_participant_data = await CreateChatParticipant(
        room_id,
        user_data,
        permissions,
      );
      if (!create_participant_data)
        throw new InternalServerErrorException(
          'An error occurred while establishing the relationship between members and the room',
        );
    });
    //如果不是雙人的聊天就更新房主的權限
    const create_sender_user_data = await CreateChatParticipant(
      room_id,
      create_room_dto.sender_user_id,
      permissions === 0 ? 0 : 2,
    );
    if (!create_sender_user_data)
      throw new InternalServerErrorException(
        'An error occurred while establishing the relationship between members and the room',
      );
    //返回成功創建
    return res.status(201).send('You have successfully create a new room');
  }
}
