import user_datas_client from 'src/DataBase/connect/UserDatas';

export default async function FindRelationshipList(Id1: any) {
  const find_relationship_query = `SELECT * FROM relationship WHERE user_id = ?;`;
  const find_relationship_parmas = [Id1];
  const find_relationship_data = await user_datas_client.execute(
    find_relationship_query,
    find_relationship_parmas,
    { prepare: true },
  );
  if (find_relationship_data.wasApplied()) {
    return find_relationship_data.rows;
  } else {
    return false;
  }
}
