import {Quiz, User} from './DBTypes';

type UserOutput = Omit<User, 'email' | 'password'>;

type UserInput = Omit<User, 'id'>;

type UserTest = Partial<User>;

type LoginUser = Omit<User, 'password'>;

type QuizInput = Omit<Quiz, 'id'>;

type QuizOut = Quiz & {favorite: boolean};

type QuizCard = Omit<Quiz, 'questions' | 'owner'>;

type QuizTest = Partial<Quiz>;

type FavoritesOut = {
  owner: UserOutput;
  items: QuizCard[];
};

export {
  UserOutput,
  UserInput,
  UserTest,
  LoginUser,
  QuizInput,
  QuizOut,
  QuizCard,
  QuizTest,
  FavoritesOut,
};
