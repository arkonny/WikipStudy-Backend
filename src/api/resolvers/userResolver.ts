import {GraphQLError} from 'graphql';
import {UserInput, UserOutput} from '../../types/DBTypes';
import fetchData from '../../functions/fetchData';
import {
  LoginResponse,
  MessageResponse,
  UserResponse,
} from '../../types/MessageTypes';
import {MyContext} from '../../types/MyContext';

// TODO: create resolvers based on user.graphql
// note: when updating or deleting a user don't send id to the auth server, it will get it from the token. So token needs to be sent with the request to the auth server

const userResolver = {
  Query: {
    userById: async (
      _parent: undefined,
      args: {id: string},
    ): Promise<UserOutput> => {
      if (!process.env.AUTH_URL) {
        throw new GraphQLError('Auth URL not set in .env file');
      }
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
      const response = {
        message: 'Token is valid',
        user: context.userdata,
      };
      return response;
    },
  },
  Mutation: {
    login: async (
      _parent: undefined,
      args: {credentials: {username: string; password: string}},
    ): Promise<LoginResponse> => {
      if (!process.env.AUTH_URL) {
        throw new GraphQLError('Auth URL not set in .env file');
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args.credentials),
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
      if (!process.env.AUTH_URL) {
        throw new GraphQLError('Auth URL not set in .env file');
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args.user),
      };

      const registerResponse = await fetchData<
        MessageResponse & {data: UserOutput}
      >(process.env.AUTH_URL + '/users', options);
      registerResponse.data.id = registerResponse.data._id;

      return {message: registerResponse.message, user: registerResponse.data};
    },
    updateUser: async (
      _parent: undefined,
      args: {user: UserInput},
      context: MyContext,
    ): Promise<UserResponse> => {
      if (!process.env.AUTH_URL) {
        throw new GraphQLError('Auth URL not set in .env file');
      }
      if (!context.userdata) {
        throw new GraphQLError('User not authenticated');
      }

      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + context.userdata.token,
        },
        body: JSON.stringify(args.user),
      };
      console.log('options', options);

      const response = await fetchData<MessageResponse & {data: UserOutput}>(
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
      if (!process.env.AUTH_URL) {
        throw new GraphQLError('Auth URL not set in .env file');
      }
      if (!context.userdata) {
        throw new GraphQLError('User not authenticated');
      }

      const user = context.userdata.user;

      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + context.userdata.token,
        },
      };

      const message = await fetchData<MessageResponse>(
        process.env.AUTH_URL + '/users',
        options,
      );

      user.id = user._id;

      return {message: message.message, user: user};
    },
  },
};

export default userResolver;
