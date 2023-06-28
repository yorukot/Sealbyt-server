import key_datas_client from 'src/DataBase/connect/KeyDatas';

export default async function DeleteRefreshToken(refreshToken: string) {
  const delete_refresh_token_query = `DELETE FROM refreshtoken WHERE refresh_token = ?;`;
  const delete_refresh_token_params = [refreshToken];
  const delete_refresh_token_response = await key_datas_client.execute(
    delete_refresh_token_query,
    delete_refresh_token_params,
    { prepare: true },
  );
  if (delete_refresh_token_response.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
