import mongoose from 'mongoose';
import { DocumentDB } from '../types';

const documentDB:DocumentDB = {
  client: "",
  
  async connect (uri: string) {
    try {
      await mongoose.connect(uri, {
        //useNewUrlParser: true,
        //useUnifiedTopology: true,
        //useCreateIndex: true
      });
      this.client = "Connected";
      return Promise.resolve(new Promise<void>((res) => res()));
    } catch (err) {
      return Promise.reject(new Promise<void>((res, rej) => rej(err)));
    }
  },

  async createTables() {}
}

module.exports = documentDB;
