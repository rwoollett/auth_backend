export interface TransferEmbed {
  [key: string]: Date|string|number|undefined;
}

export interface Transfer {
  [key: string]: Date|string|number|undefined|TransferEmbed;
}

export interface TableSchemas {
  [key: string]: () => unknown;
}

