import { Transfer } from "./Transfer";

export interface Post extends Transfer {
  id?: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  reactions: {
    thumbsUp: number;
    hooray: number;
    heart: number;
    rocket: number;
    eyes: number;
  }
}

export const POST_TABLE = 'Post';
export const postSchema = (): Post => {
  return {
    id: "",
    userId: "",
    title: "",
    content: "",
    createdAt: new Date().toLocaleString(),
    reactions: {
      thumbsUp: 0,
      hooray: 0,
      heart: 0,
      rocket: 0,
      eyes: 0
    }
  };
};

export type Emoji = "thumbsUp"|"hooray"|"heart"|"rocket"|"eyes";
export const EmojiList:Emoji[] = ["thumbsUp","hooray","heart","rocket","eyes"];
export const THUMBS_UP_EMOJI = "thumbsUp";
export const HOORAY_EMOJI = "hooray";
export const HEART_EMOJI = "heart";
export const ROCKET_EMOJI = "rocket";
export const EYES_EMOJI = "eyes";

