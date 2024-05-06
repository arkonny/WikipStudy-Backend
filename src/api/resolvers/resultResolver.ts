import {GraphQLError} from 'graphql';
import quizModel from '../models/quizModel';
import resultModel from '../models/resultModel';
import {Result} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import calculateResult from '../../functions/calculateResult';

const resultResolver = {
  Query: {
    resultsByQuiz: async (
      _parent: undefined,
      args: {quizId: string},
      context: MyContext,
    ): Promise<Result[]> => {
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }
      return await resultModel.find({
        quiz: args.quizId,
        owner: context.userdata.user._id,
      });
    },
  },
  Mutation: {
    answerQuiz: async (
      _parent: undefined,
      args: {input: {quizId: string; answers: string[]}},
      context: MyContext,
    ): Promise<Result> => {
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }

      const quiz = await quizModel.findById(args.input.quizId);
      if (!quiz) {
        console.log('Quiz not found');
        throw new GraphQLError('Quiz not found');
      }

      const score = calculateResult(quiz.questions, args.input.answers);

      const result = await resultModel.create({
        quiz: args.input.quizId,
        owner: context.userdata.user._id,
        score,
      });

      if (!result) {
        console.log('Result not created');
        throw new GraphQLError('Result not created');
      }

      console.log('result', result);
      return result;
    },
  },
};

export default resultResolver;
