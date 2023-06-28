import key_datas_client from 'src/DataBase/connect/KeyDatas';

export default async function FindKey(roomId: any, userId: any) {
  const find_chat_key_query = `SELECT * FROM chatkey WHERE room_id = ? AND user_id = ?;`;
  const find_chat_key_parmas = [roomId, userId];
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
