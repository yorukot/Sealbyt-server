import user_datas_client from 'src/DataBase/connect/UserDatas';

export default async function UpdateRelationshipDataSameStatus(
  userId: any,
  receiveId: any,
  status: number,
) {
  const update_relationship_data_query = `UPDATE SET status = ? WHERE userId = ? AND receiveId = ?`;
  const update_relationship_data_params = [
    BigInt(userId),
    BigInt(receiveId),
    status,
  ];
  const update_relationship_data = await user_datas_client.execute(
    update_relationship_data_query,
    update_relationship_data_params,
    { prepare: true },
  );
  const update_relationship_data_query_02 = `UPDATE SET status = ? WHERE userId = ? AND receiveId = ?`;
  const update_relationship_data_params_02 = [
    BigInt(receiveId),
    BigInt(userId),
    status,
  ];
  const update_relationship_data_02 = await user_datas_client.execute(
    update_relationship_data_query_02,
    update_relationship_data_params_02,
    { prepare: true },
  );
  if (
    update_relationship_data_02.wasApplied() &&
    update_relationship_data.wasApplied()
  ) {
    return true;
  } else {
    return false;
  }
}
