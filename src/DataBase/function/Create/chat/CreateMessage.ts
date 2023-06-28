import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function CreateMessage(
  messageId: string,
  bucket: number,
  roomId: string,
  userId: string,
  content: string,
  file: Array<any>,
  reply: string,
  encrypt_type: number,
) {
  const create_message_query = `INSERT INTO message (id, bucket, room_id, user_id, content, file, edited, read, reply, create_at, encrypt_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  const create_message_params = [
    messageId,
    bucket,
    roomId,
    userId,
    content,
    file,
    null,
    false,
    reply,
    Date.now(),
    encrypt_type,
  ];
  const create_message_response = await chat_datas_client.execute(
    create_message_query,
    create_message_params,
    { prepare: true },
  );
  if (create_message_response.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
