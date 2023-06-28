import key_datas_client from 'src/DataBase/connect/KeyDatas';

export default async function UpdateKeyExchange(
  userId: any,
  roomId: any,
  encryptioKey: any,
) {
  const update_key_exchange_data_query = `UPDATE chatkeyexchange SET encryption_key = ? WHERE room_id = ? AND user_id = ?`;
  const update_key_exchange_data_params = [encryptioKey, roomId, userId];
  const update_key_exchange_data = await key_datas_client.execute(
    update_key_exchange_data_query,
    update_key_exchange_data_params,
    { prepare: true },
  );
  if (update_key_exchange_data.wasApplied()) {
    return true;
  } else {
    return false;
  }
}
