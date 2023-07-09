export type DocumentDB = {
  connect: (uri: string) => Promise<void>;
  client?: undefined|Object;
  createTables: () => Promise<void>;
};

export type TableFunctions<T, TUpdate, E=string> = {
  db: DocumentDB|null;
  setDB: (newdb:DocumentDB) => void;
  find: (filter?: { [key: string]: string }) => Promise<T[]>;
  findOne: (filter: { [key: string]: string }) => Promise<T | undefined>;
  findById: (id: string) => Promise<T | undefined>;
  findByIdAndDelete: (id: string) => Promise<void>;
  add: (item: T) => Promise<T>;
  update: (id: string, update: TUpdate) => Promise<T>;
}

