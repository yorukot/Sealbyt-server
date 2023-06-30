import chat_datas_client from 'src/DataBase/connect/ChatDatas';

export default async function FindParticipantWithUserId(userId: any) {
  const find_participant_query = `SELECT * FROM participant WHERE user_id = ?;`;
  const find_participant_parmas = [userId];
  const find_participant_data = await chat_datas_client.execute(
    find_participant_query,
    find_participant_parmas,
    { prepare: true },
  );
  if (find_participant_data.wasApplied()) {
    return find_participant_data.rows;
  } else {
    return false;
  }
}
