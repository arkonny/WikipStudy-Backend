import {Document, Types} from 'mongoose';

type User = Partial<Document> & {
  id: Types.ObjectId | string;
  user_name: string;
  email: string;
  password: string;
};

type UserOutput = Omit<User, 'email' | 'password'>;

type UserInput = Omit<User, 'id'>;

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
  questions: Question[];
  owner: Types.ObjectId | UserOutput;
  filename: string | undefined;
};

type QuizCard = Omit<Quiz, 'questions' | 'owner'>;

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
  owner: Types.ObjectId | UserOutput;
  score: number;
};

type Favorites = {
  owner: Types.ObjectId | UserOutput;
  items: (Types.ObjectId | QuizCard)[];
};

type Report = {
  target: Types.ObjectId | Quiz;
  source: Types.ObjectId | User;
  message: string;
};

export {
  User,
  UserOutput,
  UserInput,
  UserTest,
  LoginUser,
  Quiz,
  QuizCard,
  QuizTest,
  Question,
  Result,
  Favorites,
  Report,
  TokenContent,
};
