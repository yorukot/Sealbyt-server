import key_datas_client from 'src/DataBase/connect/KeyDatas';

export default async function FindRefreshToken(refreshToken: any) {
  const find_refresh_token_query = `SELECT * FROM refreshtoken WHERE refresh_token = ?;`;
  const find_refresh_token_parmas = [refreshToken];
  const find_refresh_token_data = await key_datas_client.execute(
    find_refresh_token_query,
    find_refresh_token_parmas,
    { prepare: true },
  );
  if (find_refresh_token_data.wasApplied()) {
    return find_refresh_token_data.rows[0];
  } else {
    return false;
  }
}
