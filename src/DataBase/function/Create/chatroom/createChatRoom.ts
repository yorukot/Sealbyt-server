import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function CreateRoomData(
  roomId: any,
  name: string,
  roomType: number,
) {
  const create_chat_room_query = `INSERT INTO room (id, name, create_at, auto_delete, default_permission, room_type, encryption_type, theme, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?);`;
  const create_chat_room_params = [
    roomId,
    name,
    Date.now(),
    null,
    roomType === 0 ? 0 : 1,
    1,
    roomType,
    null,
    null,
  ];
  const create_chat_room_response = await chat_datas_client.execute(
    create_chat_room_query,
    create_chat_room_params,
    { prepare: true },
  );
  if (create_chat_room_response.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
