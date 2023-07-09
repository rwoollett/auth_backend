import mongoose from 'mongoose';
import { transferItemFromDocument } from './helper';
import { Password } from '../../services/password';
import { User as UserDto, userSchema as dtoSchema } from '../dto/User';
import { DocumentDB } from '../types';

// Interface of properties to create new user
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that UserModel has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Interface describe properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
    }
  }
});

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// userSchema.statics.build = (attrs: UserAttrs) => {
//   return new User(attrs);
// };
//<UserDoc, UserModel>
const User = mongoose.model('User', userSchema);

let db:DocumentDB|null;

const find = async (filter?: { [key: string]: string }): Promise<UserDto[]> => {
  let filterCriteria = {};
  if (filter) {
    filterCriteria = filter;
  }
  const documentList = await User.find(filterCriteria);
  const tmp: UserDto[] = documentList.map((item: mongoose.Document) => {
    return transferItemFromDocument(dtoSchema as () => UserDto, item);
  });

  return Promise.resolve(new Promise<UserDto[]>((res) => res(tmp)));
};


const findById = async (id: string): Promise<UserDto | undefined> => {
  const result = await User.findById(id);
  if (result) {
    const transfer = transferItemFromDocument(dtoSchema, result);
    return Promise.resolve(new Promise<UserDto | undefined>((res) => res(transfer)));
  } else {
    return Promise.resolve(new Promise<UserDto | undefined>((res) => res(undefined)));
  }
};

const findByIdAndDelete = async (id: string): Promise<void> => {
  await User.findByIdAndDelete(id);
};

const findOne = async (filter: { [key: string]: string }): Promise<UserDto | undefined> => {
  const result = await User.findOne(filter);

  if (result) {
    const transfer = transferItemFromDocument(dtoSchema as () => UserDto, result);
    return Promise.resolve(new Promise<UserDto | undefined>((res) => res(transfer)));
  } else {
    return Promise.resolve(new Promise<UserDto | undefined>((res) => res(undefined)));
  }
};

const add = async (item: UserDto): Promise<UserDto> => {

  const result = new User(item);
  await result.save();

  const transfer = transferItemFromDocument(dtoSchema as () => UserDto, result);
  return Promise.resolve(new Promise<UserDto>((res) => res(transfer)));
};

function setDB(newdb:DocumentDB) {
  db = newdb;
}

export { setDB, db, add, find, findOne, findById, findByIdAndDelete };
