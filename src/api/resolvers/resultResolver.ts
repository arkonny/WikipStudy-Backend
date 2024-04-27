import {GraphQLError} from 'graphql';
import quizModel from '../models/quizModel';
import resultModel from '../models/resultModel';
import {Result} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';

// TODO: create resolvers based on result.graphql
// note: when updating or deleting a quiz, you need to check if the user is the owner of the quiz
// note2: when updating or deleting a quiz as admin, you need to check if the user is an admin by checking the role from the user object
// note3: updating and deleting resolvers should be the same for users and admins. Use if statements to check if the user is the owner or an admin

const resultResolver = {
  Query: {
    resultsByQuiz: async (
      _parent: undefined,
      args: {quizId: string},
    ): Promise<Result[]> => {
      return await resultModel.find({quiz: args.quizId});
    },
  },
  Mutation: {
    answerQuiz: async (
      _parent: undefined,
      args: {answer: {quizId: string; answers: string[]}},
      context: MyContext,
    ): Promise<Result> => {
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }

      const quiz = await quizModel.findById(args.answer.quizId);
      if (!quiz) {
        console.log('Quiz not found');
        throw new GraphQLError('Quiz not found');
      }

      let score = 0;
      for (let i = 0; i < quiz.questions.length; i++) {
        if (quiz.questions[i].type === 'single') {
          if (quiz.questions[i].answers.toString() === args.answer.answers[i]) {
            score++;
          }
        }
      }

      const result = await resultModel.create({
        quiz: args.answer.quizId,
        user: context.userdata.user._id,
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
