import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateChatRoomDto, GetMessageDto, SendMessageDto } from './dto';
import CreateRoomData from 'src/DataBase/function/Create/chat/createChatRoom';
import generateRoomId from 'src/function/generate/GenerateRoomid';
import CreateChatParticipant from 'src/DataBase/function/Create/chat/createChatparticipant';
import FindRelationshipByBothId from 'src/DataBase/function/Find/relationship/FindByBothId';
import FindParticipantWithBothId from 'src/DataBase/function/Find/chat/FindParticipantWithBothId';
import FindRoom from 'src/DataBase/function/Find/chat/FindChatRoom';
import CreateMessage from 'src/DataBase/function/Create/chat/CreateMessage';
import generateMessageId from 'src/function/generate/GenerateMessageId';
import generateBucketId from 'src/function/generate/GenerateBucketId';
import FindUserById from 'src/DataBase/function/Find/users/FindByid';
import FindMessage from 'src/DataBase/function/Find/chat/FindMessage';
import generateOldMessageId from 'src/function/generate/GenerateOldMessageId';

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

  async SendMessage(message_dto: SendMessageDto, res: Response) {
    //取得使用者
    const user_data = await FindUserById(message_dto.sender_user_id);
    if (!user_data) throw new InternalServerErrorException('User not found');
    //查看是否有權限
    const participant_data = await FindParticipantWithBothId(
      message_dto.sender_room,
      message_dto.sender_user_id,
    );
    if (!participant_data) throw new UnauthorizedException('Unauthorized');
    //取得房間資訊
    const room_data = await FindRoom(message_dto.sender_room);
    if (!room_data)
      throw new InternalServerErrorException(
        'An unidentified error occurred when find the room',
      );
    //創建訊息資料
    const bucket_id = generateBucketId();
    const message_id = generateMessageId();
    const message_data = CreateMessage(
      message_id,
      bucket_id,
      message_dto.sender_room,
      message_dto.sender_user_id,
      message_dto.content,
      message_dto.file,
      message_dto.reply,
      room_data.encryption_type,
    );
    if (!message_data)
      throw new InternalServerErrorException(
        'An unidentified error occurred when create the message',
      );
    res.status(201).json({
      message_id: message_id,
      user_id: user_data.id,
      content: message_dto.content,
      file: message_dto.file,
      edited: null,
      read: false,
      reply: message_dto.reply,
      create_at: Date.now(),
    });
  }

  async GetMessage(
    limit: number,
    before_time: number,
    room_id: string,
    dto: GetMessageDto,
    res: Response,
  ) {
    //查看limit是否正確
    if (!limit) throw new ForbiddenException('limit must be a number');
    if (limit > 100)
      throw new ForbiddenException('limit must be less than 100');
    //查看是否有權限
    const participant_data = await FindParticipantWithBothId(
      room_id,
      dto.user_id,
    );
    if (!participant_data) throw new UnauthorizedException('Unauthorized');
    //取得message
    let now_bucket_id = generateBucketId(before_time) + 1;
    const message_array = [];
    while (message_array.length < limit) {
      now_bucket_id = now_bucket_id - 1;
      const find_limit = limit - message_array.length;
      const data = await FindMessage(
        room_id,
        now_bucket_id,
        generateOldMessageId(Number(before_time) || Date.now()),
        find_limit,
      );
      if (!data)
        throw new InternalServerErrorException(
          'An unidentified error occurred when find the message',
        );
      data.map((message) => {
        message_array.push({
          message_id: message.id,
          user_id: message.user_id,
          content: message.content,
          file: message.file,
          edited: message.edited,
          read: message.read,
          reply: message.reply,
          create_at: message.create_at,
        });
      });
      if (find_limit === data.length || data.length === 0) break;
    }
    res.status(200).json(message_array);
  }
}
