import { IsString } from 'class-validator';

export class CreateChatKeyDto {
  @IsString()
  sender_user_id: string;
  @IsString()
  room_id: string;
  @IsString()
  public_key: string;
  @IsString()
  private_key: string;
}
