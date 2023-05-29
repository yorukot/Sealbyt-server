import { IsString } from 'class-validator';

export class MessageRoomDto {
  @IsString()
  auth: string;
  @IsString()
  roomId: string;
}

export class SendMessageToRoomDto {
  @IsString()
  auth: string;
  @IsString()
  roomId: string;
  @IsString()
  content: string;
}
