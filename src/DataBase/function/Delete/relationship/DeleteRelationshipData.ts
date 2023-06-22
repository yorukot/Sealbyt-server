import user_datas_client from 'src/DataBase/connect/UserDatas';

export default async function DeleteRelationshipData(
  userId: any,
  receiveId: any,
) {
  const delete_relationship_data_query = `DELETE FROM relationship WHERE user_id = ? AND receive_id = ?;`;
  const delete_relationship_data_params = [userId, receiveId];
  const delete_relationship_data = await user_datas_client.execute(
    delete_relationship_data_query,
    delete_relationship_data_params,
    { prepare: true },
  );
  const delete_relationship_data_query_02 = `DELETE FROM relationship WHERE user_id = ? AND receive_id = ?;`;
  const delete_relationship_data_params_02 = [receiveId, userId];
  const delete_relationship_data_02 = await user_datas_client.execute(
    delete_relationship_data_query_02,
    delete_relationship_data_params_02,
    { prepare: true },
  );
  if (
    delete_relationship_data_02.wasApplied() &&
    delete_relationship_data.wasApplied()
  ) {
    return true;
  } else {
    return false;
  }
}
