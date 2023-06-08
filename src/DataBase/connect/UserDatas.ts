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
  displayName text,
  password text,
  name text,
  createAt timestamp,
  status int,
  avatar text,
  twoFactorKey text,
  factor int,
  PRIMARY KEY(id, email)
);

CREATE INDEX user_name_idx ON users (name);
CREATE INDEX user_email_idx ON users (email);
//

CREATE TABLE relationship (
  userId bigint,
  receiveId bigint,
  status int,
  createAt timestamp,
  PRIMARY KEY(userId, receiveId)
)

*/
