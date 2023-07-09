import mongoose from 'mongoose';

function transferItemFromDocument<U>(schema: () => U, item: mongoose.Document) {
  let transfer: U = schema();
  for (const key in transfer) {
    if (item.get(key)) {
      transfer[key] = item.get(key);
    }
  }
  return transfer;
}

export { transferItemFromDocument };
