import { Client } from 'cassandra-driver';

const cassandraConfig = {
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'userdatas',
};

const UsersDatasClient = new Client(cassandraConfig);

UsersDatasClient.connect().then(() => {
  console.log('Connected to Cassandra - UserDatas');
});

export default UsersDatasClient;

//CREATE TABLE users (id text, email text, name text, password text, createat timestamp, twofactor text, PRIMARY KEY(id, createat));
//CREATE INDEX users_email_index ON users (email);
//INSERT INTO users (id, language, name, email, password, craeteat, twofactor) VALUES (1111, 'zh-TW', 'nightcat', 'ben.hrc57@gmail.com', 'BEN20071020', null);
