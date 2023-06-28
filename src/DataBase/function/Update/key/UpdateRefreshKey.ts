import key_datas_client from 'src/DataBase/connect/KeyDatas';

export default async function UpdateRefreshToken(used: any, refreshToken: any) {
  const update_refresh_token_data_query = `UPDATE refreshtoken SET used = ? WHERE refresh_token = ?`;
  const update_refresh_token_data_params = [used, refreshToken];
  const update_refresh_token_data = await key_datas_client.execute(
    update_refresh_token_data_query,
    update_refresh_token_data_params,
    { prepare: true },
  );
  if (update_refresh_token_data.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
