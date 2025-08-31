// AWS DYNAMO todo
import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { POST_TABLE } from "../dto/Post";
import { USER_TABLE } from "../dto/User";
import { DocumentDB } from '../types';

const documentDB: DocumentDB = {
  client: undefined,

  async connect(uri: string) {
    try {
      this.client = new DynamoDBClient({
        region: process.env.AWS_DEFAULT_REGION as string
      });
      return Promise.resolve(new Promise<void>((res) => res()));
    } catch (err) {
      return Promise.reject(new Promise<void>((res, rej) => rej(err)));
    }
  },

  async createTables() {
    if (this.client) {
      const paramsPost = {
        AttributeDefinitions: [
          {
            AttributeName: "subject", //ATTRIBUTE_NAME_1
            AttributeType: "S" as const, //ATTRIBUTE_TYPE
          },
          {
            AttributeName: "id", //ATTRIBUTE_NAME_1
            AttributeType: "S" as const, //ATTRIBUTE_TYPE
          }
        ],
        KeySchema: [
          {
            AttributeName: "subject", //ATTRIBUTE_NAME_1
            KeyType: "HASH" as const,
          },
          {
            AttributeName: "id", //ATTRIBUTE_NAME_1
            KeyType: "RANGE" as const,
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
        TableName: POST_TABLE, //TABLE_NAME
        StreamSpecification: {
          StreamEnabled: false,
        },
      };
      const paramsUser = {
        AttributeDefinitions: [
          {
            AttributeName: "category", //(Registered)
            AttributeType: "S" as const, //ATTRIBUTE_TYPE
          },
          {
            AttributeName: "id", //ATTRIBUTE_NAME_1
            AttributeType: "S" as const, //ATTRIBUTE_TYPE
          }
        ],
        KeySchema: [
          {
            AttributeName: "category", //ATTRIBUTE_NAME_1
            KeyType: "HASH" as const
          },
          {
            AttributeName: "id", //ATTRIBUTE_NAME_1
            KeyType: "RANGE" as const,
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
        TableName: USER_TABLE, //TABLE_NAME
        StreamSpecification: {
          StreamEnabled: false,
        },
      };

      try {
        const postTabledata = await (this.client as DynamoDBClient).send(new CreateTableCommand(paramsPost));
        console.log("Post Table Created", postTabledata);
        // const userTableData = await (this.client as DynamoDBClient).send(new CreateTableCommand(paramsUser));
        // console.log("User Table Created", userTableData);
        return Promise.resolve(new Promise<void>((res) => res()));

      } catch (err) {
        console.log("createTables Error", err);
        return Promise.resolve(new Promise<void>((res, rej) => rej(`AWS create table error ${err}`)));

      }
    }
  }
}

module.exports = documentDB;
