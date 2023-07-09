import { Transfer } from "./Transfer";

export interface User extends Transfer {
  id?: string;
  name?: string;
  email: string;
  password: string;
}

export const USER_TABLE = 'User';
export const userSchema = (): User => {
  return {
    id: "",
    email: "",
    password: ""
  };
};