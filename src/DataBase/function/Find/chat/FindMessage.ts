import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function FindMessage(
  roomId: string,
  bucket: number,
  limit: number,
) {
  const find_message_query = `SELECT * FROM message WHERE room_id = ? AND bucket = ? LIMIT ?;`;
  const find_message_parmas = [roomId, bucket, limit];
  const find_message_data = await chat_datas_client.execute(
    find_message_query,
    find_message_parmas,
    { prepare: true },
  );
  if (find_message_data.wasApplied()) {
    return find_message_data.rows;
  } else {
    return false;
  }
}
