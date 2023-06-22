import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  sender_user_id: string;
  @IsArray()
  users: Array<any>;
  @IsString()
  room_name: string;
  @IsNumber()
  room_type: number;
}
