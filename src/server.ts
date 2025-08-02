import { app } from './app';
import { DatabaseConnectionError } from './errors/database-connection-error';
import { documentDB } from './models';

const start = async () => {
  console.log('Starting up.....');
  console.log('NODE_ENV', process.env.NODE_ENV);

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.PORT) {
    throw new Error('PORT must be defined');
  }
  if (!process.env.AWS_DEFAULT_REGION) {
    throw new Error('AWS_DEFAULT_REGION must be defined');
  }

  let dbUri = "";
  if (process.env.DOCTYPE === 'MONGODB') {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined');
    }
    dbUri = process.env.MONGO_URI!;
  } else if (process.env.DOCTYPE === 'DYNAMODB') {
    dbUri = "AWS";
  } else {
    throw new Error('DOCTYPE must be defined');
  }

  try {
    await documentDB.connect(dbUri);
    console.log(`Connected to ${dbUri}`);

    // if (process.env.DOCTYPE === 'DYNAMODB') {
    //   await documentDB.createTables();
    // }

  } catch (err) {
    console.log('Server', err);
    throw new DatabaseConnectionError();
  }

  const server = app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`)
  });
  process.on('SIGINT', () => {
    server.close(() => {
      console.log(`So the signal which I have Received is: SIGINT`);
    })
  })
};

start();

