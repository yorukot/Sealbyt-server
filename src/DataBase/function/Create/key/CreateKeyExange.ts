import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function CreateChatKeyExchange(
  roomId: any,
  userId: any,
  publicKey: string,
  privateKey: string,
) {
  const create_chat_key_exchange_query = `INSERT INTO chatkeyexchange (room_id, user_id, public_key, private_key, encryption_key, create_at) VALUES (?, ?, ?, ?, ?, ?);`;
  const create_chat_key_exchange_params = [
    roomId,
    userId,
    publicKey,
    privateKey,
    null,
    Date.now(),
  ];
  const create_chat_key_exchange_response = await chat_datas_client.execute(
    create_chat_key_exchange_query,
    create_chat_key_exchange_params,
    { prepare: true },
  );
  if (create_chat_key_exchange_response.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
