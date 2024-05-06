import fetchData from '../../functions/fetchData';
import {
  LoginResponse,
  MessageResponse,
  UserResponse,
} from '../../types/MessageTypes';
import {MyContext} from '../../types/MyContext';
import favoritesModel from '../models/favoritesModel';
import quizModel from '../models/quizModel';
import resultModel from '../models/resultModel';
import {LoginUser, UserInput, UserOutput} from '../../types/OutputTypes';
import {sanitizeUser} from '../../functions/sanitizer';
import {escape} from 'validator';
import deleteQuiz from '../../functions/deleteQuiz';
import {errors} from '../../functions/errors';

const userResolver = {
  Query: {
    userById: async (
      _parent: undefined,
      args: {id: string},
    ): Promise<UserOutput> => {
      if (!process.env.AUTH_URL) throw errors.envNotSet;
      const user = await fetchData<UserOutput>(
        process.env.AUTH_URL + '/users/' + args.id,
      );
      user.id = user._id;
      return user;
    },

    checkToken: async (
      _parent: undefined,
      _args: undefined,
      context: MyContext,
    ) => {
      if (!context.userdata) throw errors.authUser;
      const user = context.userdata.user;
      user.id = user._id;
      const response = {
        message: 'Token is valid',
        user,
      };
      return response;
    },
  },

  Mutation: {
    login: async (
      _parent: undefined,
      args: {credentials: {username: string; password: string}},
    ): Promise<LoginResponse> => {
      const credentials = {
        username: escape(args.credentials.username),
        password: args.credentials.password,
      };
      if (!process.env.AUTH_URL) throw errors.envNotSet;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      };
      const LoginResponse = await fetchData<LoginResponse>(
        process.env.AUTH_URL + '/auth/login',
        options,
      );
      LoginResponse.user.id = LoginResponse.user._id;
      return LoginResponse;
    },

    register: async (
      _parent: undefined,
      args: {user: UserInput},
    ): Promise<UserResponse> => {
      const user = sanitizeUser(args.user);
      if (!process.env.AUTH_URL) throw errors.envNotSet;
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      };
      const registerResponse = await fetchData<
        MessageResponse & {data: LoginUser}
      >(process.env.AUTH_URL + '/users', options);
      registerResponse.data.id = registerResponse.data._id;
      // create the favorite list for the user
      if (registerResponse.message === 'User added') {
        favoritesModel.create({owner: registerResponse.data._id, items: []});
      }
      return {message: registerResponse.message, user: registerResponse.data};
    },

    updateUser: async (
      _parent: undefined,
      args: {user: UserInput},
      context: MyContext,
    ): Promise<UserResponse> => {
      const user = sanitizeUser(args.user);
      if (!process.env.AUTH_URL) throw errors.envNotSet;
      if (!context.userdata) throw errors.authUser;
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + context.userdata.token,
        },
        body: JSON.stringify(user),
      };
      console.log('options', options);
      const response = await fetchData<MessageResponse & {data: LoginUser}>(
        process.env.AUTH_URL + '/users',
        options,
      );
      response.data.id = response.data._id;
      return {message: response.message, user: response.data};
    },

    deleteUser: async (
      _parent: undefined,
      _args: undefined,
      context: MyContext,
    ): Promise<UserResponse> => {
      if (!process.env.AUTH_URL) throw errors.envNotSet;
      if (!context.userdata) throw errors.authUser;
      const user = context.userdata.user;
      const token = context.userdata.token;
      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      };
      const message = await fetchData<MessageResponse>(
        process.env.AUTH_URL + '/users',
        options,
      );
      // delete the user's favorites, quizzes and results
      if (message.message === 'User deleted') {
        await favoritesModel.deleteOne({owner: user._id});
        const quizzes = await quizModel.find({owner: user._id});
        quizzes.forEach(async (quiz) => {
          await deleteQuiz(quiz.id, token);
        });
        await resultModel.deleteMany({owner: user._id});
      }
      user.id = user._id;
      return {message: message.message, user: user};
    },
  },
};

export default userResolver;
