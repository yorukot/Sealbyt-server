import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChatKeyDto } from './dto';
import { Response } from 'express';
import FindRoom from 'src/DataBase/function/Find/chatroom/FindChatRoom';
import FindParticipant from 'src/DataBase/function/Find/chatroom/FindParticipant';
import CreateChatKeyExchange from 'src/DataBase/function/Create/key/CreateKey';
import UpdateChatParticipantKeyStatus from 'src/DataBase/function/Update/chatroom/UpdateChatParticipantKeyStatus';

@Injectable()
export class KeyService {
  async createkeyexchange(key_dto: CreateChatKeyDto, res: Response) {
    //檢查房間是否存在
    const room_data = await FindRoom(key_dto.room_id);
    if (!room_data) throw new ForbiddenException('Room not found');
    const participant_data = await FindParticipant(
      key_dto.room_id,
      key_dto.sender_user_id,
    );
    //檢查是否有權限創建這個房間的密鑰交換
    if (!participant_data) throw new UnauthorizedException('Unauthorized');
    //檢查密鑰是否正在交換中
    if (participant_data.key_status !== 1)
      throw new ForbiddenException('A key is already being created');
    //創建密鑰交換
    const create_key_data = CreateChatKeyExchange(
      key_dto.room_id,
      key_dto.sender_user_id,
      key_dto.public_key,
      key_dto.private_key,
    );
    if (!create_key_data)
      throw new InternalServerErrorException(
        'An unidentified error occurred when attempting to create the key exchange',
      );
    //更新key_status狀態
    const update_participant_key = UpdateChatParticipantKeyStatus(
      key_dto.sender_user_id,
      key_dto.room_id,
      2,
    );
    if (!update_participant_key)
      throw new InternalServerErrorException(
        'An unidentified error occurred when attempting to update the key status',
      );
    //返回成功創建的消息
    return res.status(201).send('You have successfully create a key exchange');
  }
}
