import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateChatRoomDto, GetDto, SendMessageDto } from './dto';
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
import FindParticipantWithUserId from 'src/DataBase/function/Find/chat/FindParticipantWithUserId';

@Injectable()
export class ChatService {
  async CreateRoom(res: Response, create_room_dto: CreateChatRoomDto) {
    //查看是否沒有填成員人數
    if (create_room_dto.users.length === 0)
      throw new BadRequestException('Users must more than zero');
    //查看第一次加入人員是否過多
    if (create_room_dto.users.length > 20) {
      throw new BadRequestException(
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
    //查看房間人數是否足夠
    if (create_room_dto.room_type !== 0 && create_room_dto.users.length === 1)
      throw new BadRequestException('Users must more than three');
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
    dto: GetDto,
    res: Response,
  ) {
    //查看limit是否正確
    if (!limit) throw new BadRequestException('limit must be a number');
    if (limit > 100)
      throw new BadRequestException('limit must be less than 100');
    //查看是否有權限
    const participant_data = await FindParticipantWithBothId(
      room_id,
      dto.user_id,
    );
    if (!participant_data) throw new UnauthorizedException('Unauthorized');
    //取得room資料(後面查看是否已經查到訊息開頭的時候會用到)
    const room_data = await FindRoom(room_id);
    if (!room_data) throw new BadRequestException('Can not find this room');
    //設定現在的bucket_id (+1是因為下面的迴圈每次執行會自動-1)
    let now_bucket_id = generateBucketId(before_time) + 1;
    //創建message的array
    const message_array = [];
    //創建有關這個房間的使用者的data
    const users = {};
    //運用迴圈取得所有的message
    while (message_array.length < limit) {
      //將bucket - 1
      now_bucket_id = now_bucket_id - 1;
      //取得限制limit - message_array.length是為了查看還剩下多少的訊息需要查詢
      const find_limit = limit - message_array.length;
      //尋找訊息
      const data = await FindMessage(
        room_id,
        now_bucket_id,
        generateOldMessageId(Number(before_time) || Date.now()),
        find_limit,
      );
      //如果找不到data的話就是在查詢過程中出現error
      if (!data)
        throw new InternalServerErrorException(
          'An unidentified error occurred when find the message',
        );
      //重複每一個訊息(主要是為了將user的資料放進去，順便把訊息塞進message_array)
      for (const message of data) {
        //取得使用者資料並放進users的函數
        async function getRoomUserData() {
          let user_data = message.user_data;
          const participant_data = await FindParticipantWithBothId(
            room_id,
            message.user_id,
          );
          const person_data = await FindUserById(message.user_id);
          if (person_data) {
            user_data = {
              user_id: participant_data
                ? participant_data.user_id
                : person_data.id,
              user_display_name: participant_data
                ? participant_data.display_name || person_data.display_name
                : person_data.display_name,
              user_avatar: person_data.avatar,
            };
            users[message.user_id] = user_data;
          }
        }
        //在users沒有這個使用者，就執行查詢使用者的任務
        if (!users[message.user_id]) await getRoomUserData();
        //將訊息放進message_array
        message_array.push({
          message_id: message.id,
          user: users[message.user_id],
          content: message.content,
          file: message.file,
          edited: message.edited,
          read: message.read,
          reply: message.reply,
          create_at: message.create_at,
        });
      }
      //取得房間創建時間
      const room_bucket_id = generateBucketId(room_data.create_at);
      //如果說找到的資料已經跟當初的限制一樣或者資料返回已經是0了就跳出迴圈 !!!!!!!!!! 這邊有問題，當中間有一段時間沒講話時會因為bucket斷掉，所以找不到訊息，應該改成重複直到限制到達或者已經到達初始bucket id
      if (
        find_limit === data.length ||
        (now_bucket_id <= room_bucket_id && data.length === 0)
      )
        break;
    }
    res.status(200).json(message_array);
  }

  async FindRoom(dto: GetDto, res: Response) {
    const participant_data = await FindParticipantWithUserId(dto.user_id);
    if (!participant_data)
      throw new InternalServerErrorException(
        'An unidentifiable error occurred when finding the participant',
      );
    const room_array = [];
    await Promise.all(
      participant_data.map(async (participant) => {
        const room_data = await FindRoom(participant.room_id);
        if (!room_data) throw new InternalServerErrorException('No room found');
        room_array.push(room_data);
      }),
    );
    res.status(200).json(room_array);
  }
}
