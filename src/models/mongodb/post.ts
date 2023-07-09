import mongoose from 'mongoose';
import { transferItemFromDocument } from './helper';
import { Post as PostDto, postSchema as dtoSchema } from '../dto/Post';
import { DocumentDB, TableFunctions } from '../types';

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: mongoose.Schema.Types.Date,
  },
  reactions: {
    thumbsUp: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    hooray: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    heart: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    rocket: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    eyes: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Post = mongoose.model('Post', postSchema);

const PostTable:TableFunctions<PostDto, Partial<PostDto>> = {
  setDB(newDb: DocumentDB) { this.db = newDb },
  db: {} as DocumentDB|null,

  async find(filter?: { [key: string]: string }): Promise<PostDto[]> {
    let filterCriteria = {};
    if (filter) {
      filterCriteria = filter;
    }
    const documentList = await Post.find(filterCriteria);
    
    const tmp: PostDto[] = documentList.map((item: mongoose.Document) => {
      return transferItemFromDocument(dtoSchema as () => PostDto, item);
    });

    return Promise.resolve(new Promise<PostDto[]>((res) => res(tmp)));
  },

  async findById(id: string): Promise<PostDto | undefined> {
    const result = await Post.findById(id);
    if (result) {
      const transfer = transferItemFromDocument(dtoSchema as () => PostDto, result);
      return Promise.resolve(new Promise<PostDto | undefined>((res) => res(transfer)));
    } else {
      return Promise.resolve(new Promise<PostDto | undefined>((res) => res(undefined)));
    }
  },

  async findByIdAndDelete(id: string): Promise<void> {
    await Post.findByIdAndDelete(id);
  },

  async findOne(filter: { [key: string]: string }): Promise<PostDto | undefined> {
    const result = await Post.findOne(filter);

    if (result) {
      const transfer = transferItemFromDocument(dtoSchema as () => PostDto, result);
      return Promise.resolve(new Promise<PostDto | undefined>((res) => res(transfer)));
    } else {
      return Promise.resolve(new Promise<PostDto | undefined>((res) => res(undefined)));
    }
  },

  async add(item: PostDto): Promise<PostDto> {
    const result = new Post(item);
    await result.save();

    const transfer = transferItemFromDocument(dtoSchema as () => PostDto, result);

    return Promise.resolve(new Promise<PostDto>((res) => res(transfer)));
  },

  async update(id: string, update: Partial<PostDto>): Promise<PostDto> {
    const post = await Post.findById(id);
    if (post) {
      post.set(update);
      await post.save();
      const transfer = transferItemFromDocument(dtoSchema as () => PostDto, post);

      return Promise.resolve(new Promise<PostDto>((res) => res(transfer)));
    }
    return Promise.resolve(new Promise<PostDto>((res, rej) => rej(`Error with post update for Post Id: ${JSON.stringify(id)}`)));

  }
};

module.exports = PostTable;
