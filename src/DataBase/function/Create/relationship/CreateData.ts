import user_datas_client from 'src/DataBase/connect/UserDatas';

export default async function createRelationshipData(
  userId: any,
  receiveId: any,
  status: number,
) {
  const create_relationship_query = `INSERT INTO relationship (user_id, receive_id, status, create_at)
    VALUES (?, ?, ?, ?);`;
  const create_relationship_params = [userId, receiveId, status, Date.now()];
  const create_relationship_response = await user_datas_client.execute(
    create_relationship_query,
    create_relationship_params,
    { prepare: true },
  );
  const friend_request_query_02 = `INSERT INTO relationship (user_id, receive_id, status, create_at)
  VALUES (?, ?, ?, ?);`;
  const friend_request_params_02 = [receiveId, userId, status + 1, Date.now()];
  const create_relationship_response_02 = await user_datas_client.execute(
    friend_request_query_02,
    friend_request_params_02,
    { prepare: true },
  );
  if (
    create_relationship_response_02.wasApplied() &&
    create_relationship_response.wasApplied()
  ) {
    return true;
  } else {
    return false;
  }
}
