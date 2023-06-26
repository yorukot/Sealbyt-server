import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function CreateKeySecret(
  roomId: any,
  userId: any,
  keySecret: string,
  keyNumber: number,
) {
  const create_chat_key_query = `INSERT INTO chatkey (room_id, user_id, key_secret, key_number, create_at) VALUES (?, ?, ?, ?, ?);`;
  const create_chat_key_params = [
    roomId,
    userId,
    keySecret,
    keyNumber,
    Date.now(),
  ];
  const create_chat_key_response = await chat_datas_client.execute(
    create_chat_key_query,
    create_chat_key_params,
    { prepare: true },
  );
  if (create_chat_key_response.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
