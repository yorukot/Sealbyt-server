import { Client } from 'cassandra-driver';

const cassandra_config = {
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'chatdatas',
};

const chat_datas_client = new Client(cassandra_config);

chat_datas_client.connect().then(() => {
  console.log('Connected to Cassandra - ChatDatas');
});

export default chat_datas_client;

/*
創建KEYSPACE
CREATE KEYSPACE chatdatas WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

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

使用者在room的資訊
CREATE TABLE participant (
  room_id bigint,
  user_id bigint,
  permission int,
  key_status int,
  join_at timestamp,
  PRIMARY KEY(room_id, user_id)
);

CREATE INDEX participant_key_status_idx ON participant (key_status);

Room的資訊
CREATE TABLE room (
  id bigint,
  name text,
  avatar text,
  default_permission bigint,
  theme int,
  room_type int,
  encryption_type int,
  create_at timestamp,
  auto_delete int,
  PRIMARY KEY(id, create_at)
);

Message資訊
CREATE TABLE message (
  id bigint,
  bucket int,
  room_id bigint,
  user_id bigint,
  content text,
  file list<text>,
  create_at timestamp,
  encrypt_type int,
  PRIMARY KEY((room_id, bucket), id)
);

*/
