import {Quiz, User} from './DBTypes';

type UserOutput = Omit<User, 'email' | 'password'>;

type UserInput = Omit<User, 'id'>;

type UserTest = Partial<User>;

type LoginUser = Omit<User, 'password'>;

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
  QuizOut,
  QuizCard,
  QuizTest,
  FavoritesOut,
};
