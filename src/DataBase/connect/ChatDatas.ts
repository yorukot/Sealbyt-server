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

使用者在room的資訊
CREATE TABLE participant (
  room_id bigint,
  user_id bigint,
  display_name text,
  permission int,
  key_status int,
  join_at timestamp,
  PRIMARY KEY(room_id, user_id)
) WITH CLUSTERING ORDER BY (room_id DESC);

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
) WITH CLUSTERING ORDER BY (create_at DESC);

Message資訊
CREATE TABLE message (
  id bigint,
  bucket int,
  room_id bigint,
  user_id bigint,
  content text,
  file list<text>,
  edited timestamp,
  read boolean,
  reply bigint,
  create_at timestamp,
  encrypt_type int,
  PRIMARY KEY((room_id, bucket), id)
) WITH CLUSTERING ORDER BY (id DESC);

*/
