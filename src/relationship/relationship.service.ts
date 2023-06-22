import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { RelationShipDto, GetFriendListDto } from './dto/index';
import { UserGetewayService } from 'src/geteway/user.service';
import createRelationshipData from 'src/DataBase/function/Create/relationship/CreateData';
import UpdateRelationshipDataSameStatus from 'src/DataBase/function/Update/relationship/UpdateDataWithSameStatus';
import FindUsersByName from 'src/DataBase/function/Find/users/FindByName';
import FindRelationshipByBothId from 'src/DataBase/function/Find/relationship/FindByBothId';
import DeleteRelationshipData from 'src/DataBase/function/Delete/relationship/DeleteRelationshipData';
import FindRelationshipList from 'src/DataBase/function/Find/relationship/FindRelationshipList';
import FindUserById from 'src/DataBase/function/Find/users/FindByid';

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
        .emit('FriendRequest', { status: 3, user: user_data.id });
      //回應這個request
      return res
        .status(201)
        .send('The invitation has been successfully dispatched');
    }
    //對方是否有傳訊息給這位使用者了
    if (
      relation_request_data.status === 3 ||
      relation_request_data.status === 4
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
        .emit('FriendRequest', { status: 0, user: user_data.id });
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
    if (relation_request_data.status === 2)
      throw new ConflictException('You have already invited this user');
  }

  //接受好友請求
  async AcceptFriendRequest(sender_id: string, res: Response, id: string) {
    const relation_request_data = await FindRelationshipByBothId(sender_id, id);
    if (!relation_request_data || relation_request_data.status !== 3)
      throw new BadRequestException(
        'The user has not extended an invitation to you',
      );
    const update_relationship_data = await UpdateRelationshipDataSameStatus(
      sender_id,
      id,
      0,
    );
    if (!update_relationship_data)
      throw new InternalServerErrorException('An unexpected error occurred');
    //傳送給對方告訴她，他的請求已經被同意
    this.UserGateway.server
      .to(`user/${sender_id}`)
      .emit('FriendRequest', { status: 0, user: id });
    //回應這個request
    return res.sendStatus(204);
  }

  //拒絕好友請求
  async RejectFriendRequest(sender_id: string, res: Response, id: string) {
    const relation_request_data = await FindRelationshipByBothId(sender_id, id);
    if (
      !relation_request_data ||
      (relation_request_data.status !== 3 && relation_request_data.status !== 2)
    )
      throw new BadRequestException(
        'The user has not extended an invitation to you',
      );
    const update_relationship_data = await DeleteRelationshipData(
      sender_id,
      id,
    );
    if (!update_relationship_data)
      throw new InternalServerErrorException('An unexpected error occurred');
    //傳送給對方告訴她，他的請求已經被拒絕/取消
    this.UserGateway.server
      .to(`user/${sender_id}`)
      .emit('FriendRequest', { status: 6, user: id });
    //回應這個request
    return res.sendStatus(204);
  }

  async GetRelationshipList(res: Response, dto: GetFriendListDto) {
    //取得關係列表
    const FriendList = await FindRelationshipList(dto.user_id);
    if (Array.isArray(FriendList) && FriendList.length > 0) {
      await Promise.all(
        FriendList.map(async (friend) => {
          const user = await FindUserById(friend.receive_id);
          if (user) {
            const user_data = {
              id: user.id,
              avatar: user.avatar,
              create_at: user.create_at,
              display_name: user.display_name,
              name: user.name,
            };
            friend.user = user_data;
          }
        }),
      );
      res.status(200).json(FriendList);
    } else {
      res.status(200).json([]);
    }
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
