import user_datas_client from 'src/DataBase/connect/UserDatas';

export default async function FindUsersByName(name: string) {
  const find_user_query = `SELECT * FROM users WHERE name = ?`;
  const find_user_parmas = [name];
  const find_user_data = await user_datas_client.execute(
    find_user_query,
    find_user_parmas,
    { prepare: true },
  );
  if (find_user_data.wasApplied()) {
    return find_user_data.rows[0];
  } else {
    return false;
  }
}
