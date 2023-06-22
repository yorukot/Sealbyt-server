import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function UpdateChatParticipantPermission(
  userId: any,
  roomId: any,
  permission: number,
) {
  const update_participant_data_query = `UPDATE participant SET permission = ? WHERE room_id = ? AND user_id = ?`;
  const update_participant_data_params = [permission, roomId, userId];
  const update_participant_data = await chat_datas_client.execute(
    update_participant_data_query,
    update_participant_data_params,
    { prepare: true },
  );
  if (update_participant_data.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
