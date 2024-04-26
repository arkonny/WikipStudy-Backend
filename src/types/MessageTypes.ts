import {UserOutput} from './DBTypes';

type MessageResponse = {
  message: string;
};

type ErrorResponse = MessageResponse & {
  stack?: string;
};

type UserResponse = MessageResponse & {
  user: UserOutput;
};

type LoginResponse = MessageResponse & {
  token: string;
  user: UserOutput;
};

type UploadResponse = MessageResponse & {
  data: {
    filename: string;
  };
};

export {
  MessageResponse,
  ErrorResponse,
  UserResponse,
  LoginResponse,
  UploadResponse,
};
