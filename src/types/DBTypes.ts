import {Document, Types} from 'mongoose';
import {LoginUser, UserOutput} from './OutputTypes';

type User = Partial<Document> & {
  id: Types.ObjectId | string;
  user_name: string;
  email: string;
  password: string;
};

type TokenContent = {
  token: string;
  user: LoginUser;
};

// Separate the types for the Quiz and Question entities
type Quiz = Partial<Document> & {
  id: Types.ObjectId | string;
  quiz_name: string;
  questions: Question[];
  owner: Types.ObjectId | UserOutput;
  filename: string | undefined;
};

// A question can be of different types
type Question = {
  question: string;
  type: 'multiple' | 'single';
  options?: string[];
  answers: string[];
};

type Result = {
  quiz: Types.ObjectId | Quiz;
  owner: Types.ObjectId | UserOutput;
  score: number;
};

type Favorites = {
  owner: Types.ObjectId | UserOutput;
  items: Types.ObjectId[];
};

type Report = {
  target: Types.ObjectId | Quiz;
  source: Types.ObjectId | User;
  message: string;
};

export {User, Quiz, Question, Result, Favorites, Report, TokenContent};
