import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateKeyDto,
  CreateKeyExchangeDto,
  GetKeyExchangeDto,
  UpdateKeyExchangeDto,
} from './dto';
import { Request, Response } from 'express';
import FindRoom from 'src/DataBase/function/Find/chat/FindChatRoom';
import FindParticipantWithBothId from 'src/DataBase/function/Find/chat/FindParticipantWithBothId';
import CreateChatKeyExchange from 'src/DataBase/function/Create/key/CreateKeyExange';
import UpdateChatParticipantKeyStatus from 'src/DataBase/function/Update/chat/UpdateChatParticipantKeyStatus';
import FindKeyExchangeWithRoomId from 'src/DataBase/function/Find/key/FindKeyExchangeWithRoomId';
import UpdateKeyExchange from 'src/DataBase/function/Update/key/UpdateKeyExchange';
import FindKeyExchangeWithBothId from 'src/DataBase/function/Find/key/FindKeyExchangeWithBothId';
import FindKey from 'src/DataBase/function/Find/key/FindKey';
import CreateKeySecret from 'src/DataBase/function/Create/key/CreateKey';

@Injectable()
export class KeyService {
  async CreateKeyExchange(key_dto: CreateKeyExchangeDto, res: Response) {
    //檢查房間是否存在
    const room_data = await FindRoom(key_dto.room_id);
    if (!room_data) throw new ForbiddenException('Room not found');
    const participant_data = await FindParticipantWithBothId(
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

  //取得密要交換資訊
  async GetKeyExchange(key_dto: GetKeyExchangeDto, res: Response) {
    //查看用戶資料是否符合
    const participant_data = await FindParticipantWithBothId(
      key_dto.room_id,
      key_dto.user_id,
    );
    if (!participant_data || ![10, 7, 4].includes(participant_data.key_status))
      throw new UnauthorizedException('Unauthorized');
    //查看密鑰交換資訊是否存在
    const key_exchange_data = await FindKeyExchangeWithRoomId(key_dto.room_id);
    if (!key_exchange_data)
      throw new NotFoundException('No key exchange records were found');
    //防止私人密鑰(加密過)落入他人手中
    const key_exchange_data_json = key_exchange_data.map((key_data) => ({
      room_id: key_data.room_id,
      user_id: key_data.user_id,
      public_key: key_data.public_key,
      create_at: key_data.create_at,
    }));
    return res.status(200).json(key_exchange_data_json);
  }

  //更新密鑰交換資訊
  async UpdateKeyExchange(key_dto: UpdateKeyExchangeDto, res: Response) {
    //查看是否有權限
    const participant_data = await FindParticipantWithBothId(
      key_dto.room_id,
      key_dto.user_id,
    );
    if (!participant_data) throw new UnauthorizedException('Unauthorized');
    //查看密鑰狀態是否符合
    if (![2, 5, 8].includes(participant_data.key_status))
      throw new ForbiddenException(
        'The key exchange process has either not yet commenced or has already concluded',
      );
    //更新密鑰
    const update_key_exchange_data = await UpdateKeyExchange(
      key_dto.user_id,
      key_dto.room_id,
      key_dto.key,
    );
    if (!update_key_exchange_data)
      throw new InternalServerErrorException(
        'An unidentified error occurred when attempting to update the key exchange',
      );
    //更新密鑰狀態
    const update_participant_key = await UpdateChatParticipantKeyStatus(
      key_dto.user_id,
      key_dto.room_id,
      participant_data.key_status + 1,
    );
    if (!update_participant_key)
      throw new InternalServerErrorException(
        'An unidentified error occurred when attempting to update the key status',
      );
    return res.status(201).send('Successfully updated key exchange');
  }

  async KeyConfirm(id: string, res: Response, req: Request) {
    //查看是否有權限
    const participant_data = await FindParticipantWithBothId(id, req.user);
    if (!participant_data) throw new UnauthorizedException('Unauthorized');
    //找尋房間資訊(主要是為了查看加密方式)
    const room_data = await FindRoom(id);
    if (!room_data) throw new ForbiddenException('Room not found');
    //找到密鑰交換資訊，確保密鑰狀態正常
    const key_exchange_data = await FindKeyExchangeWithBothId(id, req.user);
    if (!key_exchange_data)
      throw new ForbiddenException(
        'The key exchange process has not been initiated yet',
      );
    if (![9, 6, 3].includes(participant_data.key_status))
      throw new ForbiddenException(
        'The key exchange confirm process has not been initiated yet',
      );
    //設定密要狀態要是多少
    let status_code = 0;
    if (room_data.encryption_type > 3 && participant_data.key_status < 9) {
      status_code = participant_data.key_status + 2;
    } else if (participant_data.key_status === 9) {
      status_code = 10;
    } else if (
      room_data.encryption_type === 1 &&
      participant_data.key_status === 3
    ) {
      status_code = 4;
    } else if (
      room_data.encryption_type < 4 &&
      participant_data.key_status < 6
    ) {
      status_code = participant_data.key_status + 2;
    } else {
      status_code = 7;
    }
    //更新密鑰狀態
    const update_participant_key = await UpdateChatParticipantKeyStatus(
      req.user,
      id,
      status_code,
    );
    if (!update_participant_key)
      throw new InternalServerErrorException(
        'An unidentified error occurred when attempting to update the key status',
      );
    return res.status(200).send('Successfully confirm key exchange');
  }

  async CreateKey(key_dto: CreateKeyDto, res: Response) {
    //查看是否有權限
    const participant_data = await FindParticipantWithBothId(
      key_dto.room_id,
      key_dto.sender_user_id,
    );
    if (!participant_data) throw new UnauthorizedException('Unauthorized');
    //獲取key(確保只有創建一次)
    const key_data = await FindKey(key_dto.room_id, key_dto.sender_user_id);
    if (key_data && key_data.length > 1)
      throw new ForbiddenException(
        'A key has already been created by you previously',
      );
    //創建key
    const create_key_data = await CreateKeySecret(
      key_dto.room_id,
      key_dto.sender_user_id,
      key_dto.key,
      1,
    );
    if (!create_key_data)
      throw new InternalServerErrorException(
        'An unidentified error occurred when attempting to create the key',
      );
    res.status(201).send('Successfully create key');
  }

  async GetKey(roomId: string, res: Response, req: Request, userId: string) {
    //查看是否有權限
    const participant_data = await FindParticipantWithBothId(roomId, userId);
    if (!participant_data) throw new UnauthorizedException('Unauthorized');
    //尋找key
    const key_data = await FindKey(roomId, userId);
    if (!key_data)
      throw new ForbiddenException(
        'You have not yet created your key on this room',
      );
    if (key_data.length < 1) throw new NotFoundException('Key not found');
    res.status(200).json(key_data[0]);
  }
}
