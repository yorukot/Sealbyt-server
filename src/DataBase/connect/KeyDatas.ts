import { Client } from 'cassandra-driver';

const cassandra_config = {
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'keydatas',
};

const key_datas_client = new Client(cassandra_config);

key_datas_client.connect().then(() => {
  console.log('Connected to Cassandra - KeyDatas');
});

export default key_datas_client;

/*
創建KEYSPACE
CREATE KEYSPACE keydatas WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

密鑰交換TABLE
CREATE TABLE chatkeyexchange (
  room_id bigint,
  user_id bigint,
  public_key text,
  private_key text,
  encryption_key text,
  create_at timestamp,
  PRIMARY KEY(room_id, user_id)
);

密鑰TABLE
CREATE TABLE chatkey (
  room_id bigint,
  user_id bigint,
  key_secret text,
  key_number int,
  create_at timestamp,
  PRIMARY KEY((room_id, user_id), create_at)
);

刷新密鑰狀態
CREATE TABLE refreshtoken (
  refresh_token text,
  create_at timestamp,
  PRIMARY KEY( refresh_token)
);

使用者已登入資料
CREATE TABLE loggeddevice (
  user_id bigint,
  data text,
  ip text,
  PRIMARY KEY( user_id, ip)
)

*/
