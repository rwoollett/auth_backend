import { Post as PostDto, postSchema as dtoSchema, POST_TABLE } from '../dto/Post';
import { DocumentDB, TableFunctions } from '../types';
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, QueryCommand, QueryCommandInput, UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { marshallOptions, unmarshallOptions } from './client';
import { v4 } from 'uuid';

const subjectExpression = { ':subject': "General" };
const keyExpression = "subject = :subject";
const subject = { subject: "General" };

const clientOptions = {
  marshallOptions: {
    ...marshallOptions,
    convertClassInstanceToMap: true // as post.reactions is an embedded object
  },
  unmarshallOptions
};

const PostTable: TableFunctions<PostDto, Partial<PostDto>> = {
  setDB(newDb: DocumentDB) {
    this.db = newDb;
  },
  db: {} as DocumentDB | null,

  async find(filter?: { [key: string]: string }): Promise<PostDto[]> {
    if (!this.db) {
      return Promise.resolve(new Promise<PostDto[]>((res, rej) => rej("No AWS client!")));
    } else {
      try {
        const client = this.db.client as DynamoDBClient;
        const ddbDocClient = DynamoDBDocumentClient.from(client, clientOptions);

        let params: QueryCommandInput = {
          TableName: POST_TABLE,
          KeyConditionExpression: keyExpression,
        };

        if (filter !== undefined) {
          params.ExpressionAttributeValues = Object.assign(
            {},
            subjectExpression,
            ...Object.entries(filter).map(([k, v], i) => {
              return ({ [`:${k}`]: v });
            })
          );
          params.FilterExpression = Object.entries(filter).reduce((prev, [k, v]) => {
            return `${prev} AND :${k} = ${v}`;
          }, "");
        } else {
          params.ExpressionAttributeValues = subjectExpression;
        }

        const data = await ddbDocClient.send(new QueryCommand(params));
        if (data.Items) {
          const items = data.Items.map(item => {
            const epochCreatedAt = item.createdAt;
            item.createdAt = new Date(epochCreatedAt);
            return item as PostDto;
          });
          return Promise.resolve(new Promise<PostDto[]>((res) => res(items)));

        } else {
          return Promise.resolve(new Promise<PostDto[]>((res) => res([] as PostDto[])));

        }
      } catch (err) {
        return Promise.resolve(new Promise<PostDto[]>((res, rej) => rej(`AWS query command error ${err}`)));

      }
    }
  },

  async findById(id: string): Promise<PostDto | undefined> {
    if (!this.db) {
      return Promise.resolve(new Promise<PostDto>((res, rej) => rej("No AWS client!")));
    } else {
      try {
        const client = this.db.client as DynamoDBClient;
        const ddbDocClient = DynamoDBDocumentClient.from(client, clientOptions);

        let params: GetCommandInput = {
          TableName: POST_TABLE,
          Key: Object.assign(
            {},
            { ...subject, id }
          )
        };

        const data = await ddbDocClient.send(new GetCommand(params));
        if (data.$metadata.httpStatusCode === 200) {
          return Promise.resolve(new Promise<PostDto>((res) => res(data.Item as PostDto)));
        }
        return Promise.resolve(new Promise<PostDto | undefined>((res) => res(undefined)));

      } catch (err) {
        return Promise.resolve(new Promise<PostDto>((res, rej) => rej(`AWS get command error ${err}`)));

      }
    }
  },

  async findByIdAndDelete(id: string): Promise<void> {
    if (!this.db) {
      return Promise.resolve(new Promise<void>((res, rej) => rej("No AWS client!")));
    } else {
      try {
        const client = this.db.client as DynamoDBClient;
        const ddbDocClient = DynamoDBDocumentClient.from(client, clientOptions);

        let params: DeleteCommandInput = {
          TableName: POST_TABLE,
          Key: Object.assign(
            {},
            { ...subject, id }
          )
        };

        const data = await ddbDocClient.send(new DeleteCommand(params));
        if (data.$metadata.httpStatusCode === 200) {
          return Promise.resolve(new Promise<void>((res) => res()));
        }
        return Promise.resolve(new Promise<void>((res, rej) => rej(`AWS delete command error`)));

      } catch (err) {
        return Promise.resolve(new Promise<void>((res, rej) => rej(`AWS delete command error ${err}`)));

      }
    }
  },

  async findOne(filter: { [key: string]: string }): Promise<PostDto | undefined> {
    if (!this.db) {
      return Promise.resolve(new Promise<PostDto>((res, rej) => rej("No AWS client!")));
    } else {
      try {
        const client = this.db.client as DynamoDBClient;
        const ddbDocClient = DynamoDBDocumentClient.from(client, { marshallOptions, unmarshallOptions });

        // expr example from the filter arg passed of { email: 'temp@test.co.nz' }
        // is: { ':category': 'Registered', ':email': 'temp@test.co.nz' }

        const params = {
          TableName: POST_TABLE,
          ExpressionAttributeValues: Object.assign({},
            subjectExpression,
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
          const item = data.Items.pop() as PostDto;

          return Promise.resolve(new Promise<PostDto>((res) => res(item)));

        } else {
          return Promise.resolve(new Promise<undefined>((res) => res(undefined)));

        }
      } catch (err) {
        return Promise.resolve(new Promise<PostDto>((res, rej) => rej(`AWS put command error ${err}`)));

      }
    }
  },

  async add(item: PostDto): Promise<PostDto> {
    if (!this.db) {
      return Promise.resolve(new Promise<PostDto>((res, rej) => rej("No AWS client!")));
    } else {
      try {
        const client = this.db.client as DynamoDBClient;
        const ddbDocClient = DynamoDBDocumentClient.from(client, clientOptions);

        item.id = v4();
        const params = {
          TableName: POST_TABLE,
          Item: {
            ...item,
            ...subject,
          },
        };

        const data = await ddbDocClient.send(new PutCommand(params));
        console.log('post add', data);
        if (data.$metadata.httpStatusCode === 200) {
          return Promise.resolve(new Promise<PostDto>((res) => res(item)));
        }
        return Promise.resolve(new Promise<PostDto>((res, rej) => rej(`AWS put command error`)));
      } catch (err) {
        return Promise.resolve(new Promise<PostDto>((res, rej) => rej(`AWS put command error ${err}`)));

      }
    }
  },

  // async update(id: string, update: Partial<PostDto>): Promise<PostDto> {
  //   const post = await Post.findById(id);
  //   if (post) {
  //     post.set(update);
  //     await post.save();
  //     const transfer = transferItemFromDocument(dtoSchema as () => PostDto, post);
  //     return Promise.resolve(new Promise<PostDto>((res) => res(transfer)));
  //   }
  //   return Promise.resolve(new Promise<PostDto>((res, rej) => rej(`Error with post update for Post Id: ${JSON.stringify(id)}`)));
  // }

  async update(id: string, update: Partial<PostDto>): Promise<PostDto> {
    if (!this.db) {
      return Promise.resolve(new Promise<PostDto>((res, rej) => rej("No AWS client!")));
    } else {
      try {
        const client = this.db.client as DynamoDBClient;
        const ddbDocClient = DynamoDBDocumentClient.from(client, clientOptions);

        let exprNames: { [key: string]: string }[] = [];
        const params: UpdateCommandInput = {
          TableName: POST_TABLE,
          Key: Object.assign(
            {},
            { ...subject, id }
          ),
          ExpressionAttributeValues: Object.assign({},
            ...Object.entries(update).map(([k, v], i) => {
              if (k.includes(".")) {
                const a = k.split(".").map(i => ({ [`#${i}`]: i }))
                exprNames = exprNames.concat(k.split(".").map(i => ({ [`#${i}`]: i })));
                return ({ [`:${k.split(".").join('_')}`]: v })
              } else {
                return ({ [`:${k}`]: v });
              }
            })),
          UpdateExpression: Object.entries(update).reduce((prev, [k]) => {
            if (k.includes(".")) {
              const embeddedName = k.split(".")
                .reduce((p, i) => (p === '#' && `${p}${i}` || `${p}.#${i}`), '#');
              const embeddedValue = k.split(".").join('_');
              return prev === 'set' &&
                `${prev} ${embeddedName} = :${embeddedValue}` ||
                `${prev}, ${embeddedName} = :${embeddedValue}`;

            } else {
              return prev === 'set' &&
                `${prev} ${k} = :${k}` ||
                `${prev}, ${k} = :${k}`;
            }
          }, "set"),
          ReturnValues: "ALL_NEW"
        };
        if (exprNames.length > 0) {
          params.ExpressionAttributeNames = Object.assign({}, exprNames.reduce(
            (prev, obj) => {
              return Object.assign(prev, { ...obj });
            },
            {}));
        }

        const data = await ddbDocClient.send(new UpdateCommand(params));
        if (data.$metadata.httpStatusCode === 200) {
          return Promise.resolve(new Promise<PostDto>((res) => res(data.Attributes as PostDto)));
        }
        return Promise.resolve(new Promise<PostDto>((res, rej) => rej("AWS update command error")));

      } catch (err) {
        return Promise.resolve(new Promise<PostDto>((res, rej) => rej(`AWS update command error ${err}`)));

      }
    }

  }

};

module.exports = PostTable;
