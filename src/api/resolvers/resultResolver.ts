import quizModel from '../models/quizModel';
import resultModel from '../models/resultModel';
import {Result} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import {errors} from '../../functions/errors';

const resultResolver = {
  Query: {
    resultsByQuiz: async (
      _parent: undefined,
      args: {quizId: string},
      context: MyContext,
    ): Promise<Result[]> => {
      if (!context.userdata) throw errors.authUser;
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
      if (!context.userdata) throw errors.authUser;

      const quiz = await quizModel.findById(args.input.quizId);
      if (!quiz) throw errors.notFound;

      let score = 0;
      for (let i = 0; i < quiz.questions.length; i++) {
        if (quiz.questions[i].answers[0].toString() === args.input.answers[i]) {
          score++;
        }
      }

      const result = await resultModel.create({
        quiz: args.input.quizId,
        owner: context.userdata.user._id,
        score,
      });

      if (!result) throw errors.notCreated;
      return result;
    },
  },
};

export default resultResolver;
