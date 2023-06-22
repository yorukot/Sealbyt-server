import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function FindRoom(roomId: any) {
  const find_room_query = `SELECT * FROM room WHERE id = ?;`;
  const find_room_parmas = [roomId];
  const find_room_data = await chat_datas_client.execute(
    find_room_query,
    find_room_parmas,
    { prepare: true },
  );
  if (find_room_data.wasApplied()) {
    return find_room_data.rows[0];
  } else {
    return false;
  }
}
