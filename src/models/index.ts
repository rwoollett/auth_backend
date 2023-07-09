import { User } from './dto/User';
import { Post } from './dto/Post';
import { DocumentDB, TableFunctions } from './types';

let documentDB: DocumentDB = {
  connect(uri: string) { return Promise.resolve(new Promise<void>((res) => res())); },
  client() { return null },
  createTables() { return Promise.resolve(new Promise<void>((res) => res())); },
}

let PostTable: TableFunctions<Post, Partial<Post>>;
let UserTable: TableFunctions<User, unknown>;

if (process.env.DOCTYPE === 'MONGODB' || process.env.NODE_ENV === 'test') {
  documentDB = require('./mongodb');
  PostTable = require('./mongodb/post');
  UserTable = require('./mongodb/user')
} else if (process.env.DOCTYPE === 'DYNAMODB') {
  console.log(process.env.DOCTYPE);
  documentDB = require('./dynamo');
  PostTable = require('./dynamo/post');
  UserTable = require('./dynamo/user');
} else { // !!Default if no DOCTYPE set
  documentDB = require('./mongodb');
  PostTable = require('./mongodb/post');
  UserTable = require('./mongodb/user')
}

PostTable.db = documentDB;
UserTable.setDB(documentDB);

export { documentDB, PostTable, UserTable, User, Post };