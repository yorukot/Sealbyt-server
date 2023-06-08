import { IsString } from 'class-validator';

export class RoomDto {
  @IsString()
  roomId: string;
}

export class ScoketUserDto {
  @IsString()
  id: string;
  @IsString()
  name: string;
}
