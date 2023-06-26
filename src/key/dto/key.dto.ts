import { IsString } from 'class-validator';

export class CreateKeyExchangeDto {
  @IsString()
  sender_user_id: string;
  @IsString()
  room_id: string;
  @IsString()
  public_key: string;
  @IsString()
  private_key: string;
}

export class UpdateKeyExchangeDto {
  @IsString()
  sender_user_id: string;
  @IsString()
  room_id: string;
  @IsString()
  user_id: string;
  @IsString()
  key: string;
}

export class GetKeyExchangeDto {
  @IsString()
  user_id: string;
  @IsString()
  room_id: string;
}

export class CreateKeyDto {
  @IsString()
  sender_user_id: string;
  @IsString()
  room_id: string;
  @IsString()
  key: string;
}

export class GetKeyDto {
  @IsString()
  user_id: string;
}
