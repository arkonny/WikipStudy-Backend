import {GraphQLError} from 'graphql';
import {Report} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import reportModel from '../models/reportModel';
import quizModel from '../models/quizModel';
import {escape} from 'validator';

const reportResolver = {
  Mutation: {
    reportAdd: async (
      _parent: undefined,
      args: {target: string; message: string},
      context: MyContext,
    ): Promise<Report> => {
      const message = escape(args.message);
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }
      const quizTarget = await quizModel.findById(args.target);
      if (!quizTarget) {
        console.log('Quiz not found');
        throw new GraphQLError('Quiz not found', {
          extensions: {code: 'NOT_FOUND'},
        });
      }
      const report = reportModel.create({
        target: quizTarget.id,
        source: context.userdata.user._id,
        message: message,
      });
      if (!report) {
        console.log('Report not created');
        throw new GraphQLError('Report not created', {
          extensions: {code: 'INTERNAL_SERVER_ERROR'},
        });
      }
      return report;
    },
  },
};

export default reportResolver;
