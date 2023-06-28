import { Client } from 'cassandra-driver';

const cassandra_config = {
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'userdatas',
};

const user_datas_client = new Client(cassandra_config);

user_datas_client.connect().then(() => {
  console.log('Connected to Cassandra - UserDatas');
});

export default user_datas_client;

/*
創建KEYSPACE
CREATE KEYSPACE userdatas WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

使用者資料TABLE
CREATE TABLE users (
  id bigint,
  email text,
  display_name text,
  password text,
  name text,
  create_at timestamp,
  status int,
  avatar text,
  two_factor_key text,
  factor int,
  PRIMARY KEY(id, email)
) WITH CLUSTERING ORDER BY (create_at DESC);

CREATE INDEX user_name_idx ON users (name);
CREATE INDEX user_email_idx ON users (email);
//

CREATE TABLE relationship (
  user_id bigint,
  receive_id bigint,
  status int,
  create_at timestamp,
  PRIMARY KEY(user_id, receive_id)
)

*/
