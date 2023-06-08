import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import user_datas_client from 'src/DataBase/connect/UserDatas';
import {
  DecideFriendRequestDto,
  GetFriendRequestListDto,
  RelationShipDto,
  GetFriendListDto,
} from './dto/index';
import { UserGetewayService } from 'src/geteway/user.service';
import createRelationshipData from 'src/DataBase/function/Create/relationship/CreateData';
import UpdateRelationshipDataSameStatus from 'src/DataBase/function/Update/relationship/sameStatus';
import FindUsersByName from 'src/DataBase/function/Find/users/FindByName';
import FindRelationshipByBothId from 'src/DataBase/function/Find/relationship/FindByBothId';

@Injectable()
export class RelationshipService {
  constructor(private UserGateway: UserGetewayService) {}
  // 發送好友邀請
  async AddFriend(res: Response, dto: RelationShipDto) {
    // 查詢對方說要邀請的使用者，並判斷是否存在
    const user_data = await FindUsersByName(dto.user_name);
    if (!user_data) throw new NotFoundException('The user does not exist');

    //判斷對方是否已經成為好友或者被對方黑名單
    if (user_data.id === dto.sender_user_id)
      throw new BadRequestException('You cannot invite yourself as a friend');
    const relation_request_data = await FindRelationshipByBothId(
      dto.sender_user_id,
      user_data.id,
    );
    //如果沒找到資料
    if (!relation_request_data) {
      //創建資料
      const create_relationship_data = await createRelationshipData(
        dto.sender_user_id,
        user_data.id,
        2,
      );
      if (!create_relationship_data)
        throw new InternalServerErrorException('An unexpected error occurred');
      //傳送給對方告訴她，有新好友請求
      this.UserGateway.server
        .to(`user/${user_data.id.toString()}`)
        .emit('FriendRequest', { status: 3, user: dto.sender_user_id });
      //回應這個request
      return res
        .status(201)
        .send('The invitation has been successfully dispatched');
    }
    //對方是否有傳訊息給這位使用者了
    if (
      relation_request_data.rowLength === 3 ||
      relation_request_data.rowLength === 4
    ) {
      //更新資料
      const update_relationship_data = await UpdateRelationshipDataSameStatus(
        dto.sender_user_id,
        user_data.id,
        0,
      );
      if (!update_relationship_data)
        throw new InternalServerErrorException('An unexpected error occurred');
      //傳送給對方告訴她，他的請求已經被同意
      this.UserGateway.server
        .to(`user/${user_data.id.toString()}`)
        .emit('FriendRequest', { status: 0, user: dto.sender_user_id });
      //回應這個request
      return res
        .status(200)
        .send('You have successfully accepted the friend request');
    }
    //查看是否雙方已經是好友
    if (relation_request_data.status === 0)
      throw new ForbiddenException('You are already friends with this user');
    //查看對方是否已經把他封鎖
    if (relation_request_data.status === 5)
      throw new NotFoundException('The user does not exist');
    //檢查是否已經傳過請求
    if (relation_request_data.rowLength === 2)
      throw new ConflictException('You have already invited this user');
  }

  //接受好友請求
  async AcceptFriendRequest(res: Response, dto: DecideFriendRequestDto) {
    const accept_friend_request_data_query = `DELETE FROM friend_requests WHERE sender_id = ? AND receiver_id = ? IF EXISTS;`;
    const accept_friend_request_parmas = [dto.user_id, dto.sender_user_id];
    const accept_friend_request_data = await user_datas_client.execute(
      accept_friend_request_data_query,
      accept_friend_request_parmas,
      {
        prepare: true,
      },
    );
    if (!accept_friend_request_data.wasApplied())
      throw new BadRequestException(
        'The user has not extended an invitation to you',
      );
    const add_relationship_data_query = `INSERT INTO relationship (user_id_1, user_id_2, created_at, relation)
      VALUES (?, ?, ?, ?);`;
    const add_relationship_data_parmas = [
      `${
        Number(dto.user_id) < Number(dto.sender_user_id)
          ? dto.sender_user_id
          : dto.user_id
      }`,
      `${
        Number(dto.sender_user_id) < Number(dto.sender_user_id)
          ? dto.sender_user_id
          : dto.user_id
      }`,
      Date.now(),
      0,
    ];
    const add_relationship_data = await user_datas_client.execute(
      add_relationship_data_query,
      add_relationship_data_parmas,
      {
        prepare: true,
      },
    );
    if (add_relationship_data)
      res.status(201).send('Successfully accepted friend request');
  }

  //拒絕好友請求
  async RejectFriendRequest(res: Response, dto: DecideFriendRequestDto) {
    const accept_friend_request_data_query = `DELETE FROM friend_requests WHERE sender_id = ? AND receiver_id = ? IF EXISTS;`;
    const accept_friend_request_parmas = [dto.user_id, dto.sender_user_id];
    const accept_friend_request_data = await user_datas_client.execute(
      accept_friend_request_data_query,
      accept_friend_request_parmas,
      {
        prepare: true,
      },
    );
    if (!accept_friend_request_data.wasApplied())
      throw new BadRequestException(
        'The user has not extended an invitation to you',
      );
    if (accept_friend_request_data.wasApplied())
      res.status(201).send('Successfully reject friend request');
  }

  async GetFriendList(res: Response, dto: GetFriendListDto) {
    //取得從自己ID較大的好友列表
    const get_friend_list_from_user_01_data_query = `SELECT * FROM relationship WHERE user_id_1 = ?;`;
    const get_friend_list_from_user_01_data_parmas = [dto.user_id];
    const get_friend_list_from_user_01_data = (
      await user_datas_client.execute(
        get_friend_list_from_user_01_data_query,
        get_friend_list_from_user_01_data_parmas,
        {
          prepare: true,
        },
      )
    ).rows;
    //取得從別人ID較大的好友列表
    const get_friend_list_from_user_02_data_query = `SELECT * FROM relationship WHERE user_id_2 = ?;`;
    const get_friend_list_from_user_02_data_parmas = [dto.user_id];
    const get_friend_list_from_user_02_data = (
      await user_datas_client.execute(
        get_friend_list_from_user_02_data_query,
        get_friend_list_from_user_02_data_parmas,
        {
          prepare: true,
        },
      )
    ).rows;
    res
      .status(200)
      .json([
        ...get_friend_list_from_user_01_data,
        ...get_friend_list_from_user_02_data,
      ]);
  }

  // 取得好友請求列表(包括自己發送的或別人發送的)
  async GetFriendsRequestList(dto: GetFriendRequestListDto, res: Response) {
    //取得從自己發送的好友列表
    const get_friend_request_from_sender_data_query = `SELECT * FROM friend_requests WHERE sender_id = ?;`;
    const get_friend_request_from_sender_data_parmas = [dto.user_id];
    const friend_request_from_sender_data = (
      await user_datas_client.execute(
        get_friend_request_from_sender_data_query,
        get_friend_request_from_sender_data_parmas,
        {
          prepare: true,
        },
      )
    ).rows;
    //取得從別人發送的好友列表
    const get_friend_request_from_receiver_data_query = `SELECT * FROM friend_requests WHERE receiver_id = ?;`;
    const get_friend_request_from_receiver_data_parmas = [dto.user_id];
    const friend_request_from_receiver_data = (
      await user_datas_client.execute(
        get_friend_request_from_receiver_data_query,
        get_friend_request_from_receiver_data_parmas,
        {
          prepare: true,
        },
      )
    ).rows;
    res.status(200).json({
      //別人發送的好友列表
      RequestData: friend_request_from_receiver_data,
      //自己發送的好友列表
      SenderData: friend_request_from_sender_data,
    });
  }
}

/*
0 = 雙方是好友
1 = 雙方都黑名單對方
2 = userId請求receiveId作為好友
3 = receiveId請求userId作為好友
4 = userId黑名單receiveId
5 = receiveId黑名單userId
*/
