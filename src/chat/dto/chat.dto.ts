import { IsArray, IsNumber, IsString, ValidateIf } from 'class-validator';

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

export class SendMessageDto {
  @IsString()
  sender_user_id: string;
  @IsString()
  sender_room: string;
  @IsString()
  content: string;
  @IsArray()
  file: Array<any>;
  @IsString()
  @ValidateIf((object, value) => value !== null)
  reply: string | null;
}

export class GetDto {
  @IsString()
  user_id: string;
}
