import key_datas_client from 'src/DataBase/connect/KeyDatas';

export default async function FindKeyExchangeWithRoomId(roomId: any) {
  const find_chat_key_query = `SELECT * FROM chatkeyexchange WHERE room_id = ?;`;
  const find_chat_key_parmas = [roomId];
  const find_chat_key_data = await key_datas_client.execute(
    find_chat_key_query,
    find_chat_key_parmas,
    { prepare: true },
  );
  if (find_chat_key_data.wasApplied()) {
    return find_chat_key_data.rows;
  } else {
    return false;
  }
}
