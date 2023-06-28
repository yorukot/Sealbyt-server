import key_datas_client from 'src/DataBase/connect/KeyDatas';

export default async function CreateRefreshToken(refreshToken: string) {
  const create_refresh_token_query = `INSERT INTO refreshtoken (refresh_token, create_at) VALUES (?, ?);`;
  const create_refresh_token_params = [refreshToken, Date.now()];
  const create_refresh_token_response = await key_datas_client.execute(
    create_refresh_token_query,
    create_refresh_token_params,
    { prepare: true },
  );
  if (create_refresh_token_response.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
