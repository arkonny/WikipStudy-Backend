import {GraphQLError} from 'graphql';

export const errors = {
  authUser: new GraphQLError('User not authenticated', {
    extensions: {code: 'UNAUTHENTICATED'},
  }),
  notFound: new GraphQLError('Not found', {
    extensions: {code: 'NOT_FOUND'},
  }),
  notCreated: new GraphQLError('Not created', {
    extensions: {code: 'INTERNAL_SERVER_ERROR'},
  }),
  notDeleted: new GraphQLError('Not deleted', {
    extensions: {code: 'INTERNAL_SERVER_ERROR'},
  }),
  notUpdated: new GraphQLError('Not updated', {
    extensions: {code: 'INTERNAL_SERVER_ERROR'},
  }),
  userNotOwner: new GraphQLError('User is not the owner of the quiz', {
    extensions: {code: 'UNAUTHORIZED'},
  }),
  wrongInput: new GraphQLError('Wrong input', {
    extensions: {code: 'BAD_USER_INPUT'},
  }),
  envNotSet: new GraphQLError('Environment variable not set', {
    extensions: {code: 'DEV_ERROR'},
  }),
};
