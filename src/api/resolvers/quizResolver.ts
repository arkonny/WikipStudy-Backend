import {GraphQLError} from 'graphql';
import quizModel from '../models/quizModel';
import {Quiz, QuizCard} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import resultModel from '../models/resultModel';

const quizResolver = {
  Query: {
    quizById: async (
      _parent: undefined,
      args: {id: string},
      context: MyContext,
    ): Promise<Quiz> => {
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }
      const quiz = await quizModel.findById(args.id).populate('owner');
      if (!quiz) {
        console.log('Quiz not found');
        throw new GraphQLError('Quiz not found');
      }
      if (quiz.owner.id !== context.userdata.user._id) {
        quiz.questions.forEach((question) => {
          question.answers = [];
        });
      }
      return quiz;
    },

    quizResearch: async (
      _parent: undefined,
      args: {search: string},
    ): Promise<QuizCard[]> => {
      return await quizModel
        .find({
          quiz_name: {$regex: args.search, $options: 'i'},
        })
        .populate('owner');
    },

    quizzes: async (): Promise<QuizCard[]> => {
      return await quizModel.find().populate('owner');
    },

    quizzesByOwner: async (
      _parent: undefined,
      args: {owner: string},
    ): Promise<QuizCard[]> => {
      return await quizModel.find({owner: args.owner}).populate('owner');
    },
  },

  Mutation: {
    createQuiz: async (
      _parent: undefined,
      args: {input: Omit<Quiz, 'id'>},
      context: MyContext,
    ): Promise<Quiz> => {
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }
      args.input.owner = context.userdata.user._id;
      const newQuiz = await quizModel.create(args.input);
      if (!newQuiz) {
        console.log('Quiz not created');
        throw new GraphQLError('Quiz not created');
      }
      try {
        const quiz = await quizModel.findById(newQuiz._id).populate('owner');
        if (!quiz) {
          console.log('Quiz not found');
          throw new GraphQLError('Quiz not found');
        }
        return quiz;
      } catch (error) {
        console.log('error', error);
      }
      return newQuiz;
    },

    updateQuiz: async (
      _parent: undefined,
      args: {id: string; input: Quiz},
      contextValue: MyContext,
    ): Promise<Quiz> => {
      if (!contextValue.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }
      try {
        const quizUser = await quizModel.findById(args.id).populate('owner');
        if (!quizUser) {
          console.log('Quiz not found');
          throw new GraphQLError('Quiz not found');
        } else if (quizUser.owner.id !== contextValue.userdata.user._id) {
          console.log('User is not the owner of the quiz');
          throw new GraphQLError('User is not the owner of the quiz');
        }
        const quiz = await quizModel
          .findByIdAndUpdate(args.id, args.input, {
            new: true,
          })
          .populate('owner');
        if (!quiz) {
          console.log('Quiz not updated');
          throw new GraphQLError('Quiz not updated');
        }
        return quiz;
      } catch (error) {
        console.log('error', error);
      }
      return args.input;
    },

    deleteQuiz: async (
      _parent: undefined,
      args: {id: string},
      contextValue: MyContext,
    ): Promise<Quiz> => {
      if (!contextValue.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }
      const quizUser = await quizModel.findById(args.id).populate('owner');
      if (!quizUser) {
        console.log('Quiz not found');
        throw new GraphQLError('Quiz not found');
      } else if (quizUser.owner.id !== contextValue.userdata.user._id) {
        console.log('User is not the owner of the quiz');
        throw new GraphQLError('User is not the owner of the quiz');
      }
      const quiz = await quizModel.findByIdAndDelete(args.id).populate('owner');
      if (!quiz) {
        console.log('Quiz not deleted');
        throw new GraphQLError('Quiz not deleted');
      }
      await resultModel.deleteMany({quiz: args.id});
      return quiz;
    },
  },
};

export default quizResolver;
