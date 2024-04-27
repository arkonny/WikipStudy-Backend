import {Document, Types} from 'mongoose';

type User = Partial<Document> & {
  id: Types.ObjectId | string;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
};

type UserOutput = Omit<User, 'password' | 'role'>;

type UserInput = Omit<User, 'id' | 'role'>;

type UserTest = Partial<User>;

type LoginUser = Omit<User, 'password'>;

type TokenContent = {
  token: string;
  user: LoginUser;
};

// Separate the types for the Quiz and Question entities
type Quiz = Partial<Document> & {
  id: Types.ObjectId | string;
  quiz_name: string;
  questions: [Question];
  owner: Types.ObjectId | User;
  filename: string | undefined;
};

type QuizTest = Partial<Quiz>;

// A question can be of different types
type Question = {
  question: string;
  type: 'multiple' | 'single';
  options?: string[];
  answers: string[];
};

type Result = {
  quiz: Types.ObjectId | Quiz;
  user: Types.ObjectId | User;
  score: number;
};

export {
  User,
  UserOutput,
  UserInput,
  UserTest,
  LoginUser,
  Quiz,
  QuizTest,
  Question,
  Result,
  TokenContent,
};
