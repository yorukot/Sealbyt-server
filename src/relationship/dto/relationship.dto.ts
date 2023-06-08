import { IsString } from 'class-validator';

export class RelationShipDto {
  @IsString()
  sender_user_id: string;
  @IsString()
  user_name: string;
}

export class GetFriendRequestListDto {
  @IsString()
  user_id: string;
}

export class GetFriendListDto {
  @IsString()
  user_id: string;
}

export class DecideFriendRequestDto {
  @IsString()
  sender_user_id: string;
  @IsString()
  user_id: string;
}
