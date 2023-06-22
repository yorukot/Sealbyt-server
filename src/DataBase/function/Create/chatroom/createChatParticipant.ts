import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function CreateChatParticipant(
  roomId: any,
  userId: any,
  permission: number,
) {
  const create_chat_participant_query = `INSERT INTO participant (room_id, user_id, join_at, key_status, permission) VALUES (?, ?, ?, ?, ?);`;
  const create_chat_participant_params = [
    roomId,
    userId,
    Date.now(),
    0,
    permission,
  ];
  const create_chat_participant_response = await chat_datas_client.execute(
    create_chat_participant_query,
    create_chat_participant_params,
    { prepare: true },
  );
  if (create_chat_participant_response.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
