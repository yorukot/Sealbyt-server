import user_datas_client from 'src/DataBase/connect/UserDatas';

export default async function createUsersData(
  id: any,
  email: string,
  displayName: string,
  password: string,
  name: string,
  createAt: any,
  status: number,
  avatar: string,
  twoFactorKey: any,
  factor: number,
) {
  const create_user_data_query = `INSERT INTO users (id, email, display_name, password, name, create_at, status, avatar, two_factor_key, factor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const create_user_data_params = [
    id,
    email,
    displayName,
    password,
    name,
    createAt,
    status,
    avatar,
    twoFactorKey,
    factor,
  ];
  const create_user_data = await user_datas_client.execute(
    create_user_data_query,
    create_user_data_params,
    { prepare: true },
  );
  if (create_user_data.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
