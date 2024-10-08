/* eslint-disable node/no-extraneous-import */
require('dotenv').config();
import express from 'express';
import cors from 'cors';
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import typeDefs from './api/schemas/index';
import resolvers from './api/resolvers/index';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import {notFound, errorHandler} from './middlewares';
import authenticate from './functions/authenticate';
import {createRateLimitRule} from 'graphql-rate-limit';
import {shield} from 'graphql-shield';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {applyMiddleware} from 'graphql-middleware';
import {MyContext} from './types/MyContext';
import {GraphQLError} from 'graphql';
import helmet from 'helmet';
import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from 'graphql-constraint-directive';

const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

(async () => {
  try {
    /*
    // TODO Create a rate limit rule instance (not WSK2 course)
    const rateLimitRule = createRateLimitRule({
      identifyContext: (ctx) => ctx.id,
    });

    // TODO Create a permissions object (not WSK2 course)
    const permissions = shield({
      Mutation: {
        login: rateLimitRule({window: '1m', max: 5}),
      },
    });
    */

    const schema_executable = constraintDirective()(
      makeExecutableSchema({
        typeDefs: [constraintDirectiveTypeDefs, typeDefs],
        resolvers,
      }),
    );

    // /!\ For when shield is fixed /!\
    //const schema = applyMiddleware(schema_executable, permissions);
    const schema = applyMiddleware(schema_executable);

    const server = new ApolloServer<MyContext>({
      schema,
      introspection: true,
      plugins: [
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({
              embed: true as false,
            })
          : ApolloServerPluginLandingPageLocalDefault(),
      ],
      includeStacktraceInErrorResponses: false,
      formatError: (formattedError, error) => {
        console.log('error:', error);
        console.log('formattederror:', formattedError);

        if (process.env.NODE_ENV === 'development') {
          return formattedError;
        } else if (formattedError.extensions?.code !== 'DEV_ERROR') {
          return {
            message: formattedError.message,
            extensions: formattedError.extensions,
          };
        }

        return new GraphQLError('Internal server error');
      },
    });
    await server.start();

    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      express.json(),
      expressMiddleware(server, {
        context: async ({req}) => authenticate(req),
      }),
    );

    app.use(notFound);
    app.use(errorHandler);
  } catch (error) {
    console.log(error);
  }
})();

export default app;
