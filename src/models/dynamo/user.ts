import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { Password } from '../../services/password';
import { User as UserDto, USER_TABLE } from '../dto/User';
import { DocumentDB } from '../types';
import { marshallOptions, unmarshallOptions } from './client';
import { v4 } from 'uuid';

let db: DocumentDB | null;
const categoryExpression = { ':category': "Registered" };
const keyExpression = "category = :category";
const registered = { category: "Registered"};

const find = async (filter?: { [key: string]: string }): Promise<UserDto[]> => {
  if (!db) {
    return Promise.resolve(new Promise<UserDto[]>((res, rej) => rej("No AWS client!")));
  } else {
    try {
      const client = db.client as DynamoDBClient;
      const ddbDocClient = DynamoDBDocumentClient.from(client, { marshallOptions, unmarshallOptions });

      // expr example from the filter arg passed of { email: 'temp@test.co.nz' }
      // is: { ':category': 'Registered', ':email': 'temp@test.co.nz' }
      let params: QueryCommandInput = {
        TableName: USER_TABLE,
        KeyConditionExpression: keyExpression,
      };

      if (filter !== undefined) {
        params.ExpressionAttributeValues = Object.assign(
          {},
          categoryExpression,
          ...Object.entries(filter).map(([k, v], i) => {
            return ({ [`:${k}`]: v });
          })
        );
        params.FilterExpression = Object.entries(filter).reduce((prev, [k, v]) => {
          return `${prev} AND :${k} = ${v}`;
        }, "");
      } else {
        params.ExpressionAttributeValues = categoryExpression;
      }

      const data = await ddbDocClient.send(new QueryCommand(params));
      if (data.Items) {
        const items = data.Items.map(item => item as UserDto);
        return Promise.resolve(new Promise<UserDto[]>((res) => res(items)));

      } else {
        return Promise.resolve(new Promise<UserDto[]>((res) => res([] as UserDto[])));

      }
    } catch (err) {
      return Promise.resolve(new Promise<UserDto[]>((res, rej) => rej(`AWS put command error ${err}`)));

    }
  }
};

const findOne = async (filter: { [key: string]: string }): Promise<UserDto | undefined> => {
  if (!db) {
    return Promise.resolve(new Promise<UserDto>((res, rej) => rej("No AWS client!")));
  } else {
    try {
      const client = db.client as DynamoDBClient;
      const ddbDocClient = DynamoDBDocumentClient.from(client, { marshallOptions, unmarshallOptions });

      // expr example from the filter arg passed of { email: 'temp@test.co.nz' }
      // is: { ':category': 'Registered', ':email': 'temp@test.co.nz' }

      const params = {
        TableName: USER_TABLE,
        ExpressionAttributeValues: Object.assign({},
          categoryExpression, 
          ...Object.entries(filter).map(([k, v], i) => {
          return ({ [`:${k}`]: v });
        })),
        KeyConditionExpression: keyExpression,
        FilterExpression: Object.entries(filter).reduce((prev, [k]) => {
          return prev && `${prev} AND :${k} = ${k}` || `:${k} = ${k}`;
        }, "")
      };

      const data = await ddbDocClient.send(new QueryCommand(params));
      if (data.Items) {
        const item = data.Items.pop() as UserDto;

        return Promise.resolve(new Promise<UserDto>((res) => res(item)));

      } else {
        return Promise.resolve(new Promise<undefined>((res) => res(undefined)));

      }
    } catch (err) {
      return Promise.resolve(new Promise<UserDto>((res, rej) => rej(`AWS put command error ${err}`)));

    }
  }
};

const add = async (item: UserDto): Promise<UserDto> => {
  if (!db) {
    return Promise.resolve(new Promise<UserDto>((res, rej) => rej("No AWS client!")));
  } else {
    try {
      const client = db.client as DynamoDBClient;
      const ddbDocClient = DynamoDBDocumentClient.from(client, { marshallOptions, unmarshallOptions });

      const hashed = await Password.toHash(item.password);
      item.password = hashed;
      item.id = v4(); 

      const params = {
        TableName: USER_TABLE,
        Item: {
          ...item,
          ...registered
        },
      };
      const data = await ddbDocClient.send(new PutCommand(params));
      if (data.$metadata.httpStatusCode === 200) {
        return Promise.resolve(new Promise<UserDto>((res) => res(item)));
      }
      return Promise.resolve(new Promise<UserDto>((res, rej) => rej(`AWS put command error`)));
    } catch (err) {
      return Promise.resolve(new Promise<UserDto>((res, rej) => rej(`AWS put command error ${err}`)));

    }
  }
};

function setDB(newdb: DocumentDB) {
  db = newdb;
}

export { setDB, db, add, find, findOne };
//findById, findByIdAndDelete
