import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function FindParticipant(roomId: any, userId: any) {
  const find_participant_query = `SELECT * FROM participant WHERE room_id = ? AND user_id = ?;`;
  const find_participant_parmas = [roomId, userId];
  const find_participant_data = await chat_datas_client.execute(
    find_participant_query,
    find_participant_parmas,
    { prepare: true },
  );
  if (find_participant_data.wasApplied()) {
    return find_participant_data.rows[0];
  } else {
    return false;
  }
}
