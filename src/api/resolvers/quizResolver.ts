import quizModel from '../models/quizModel';
import {Quiz} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import wikiPage from '../../functions/wikiPage';
import textToQuestions from '../../functions/textToQuestions';
import favoritesModel from '../models/favoritesModel';
import {QuizCard, QuizInput, QuizOut} from '../../types/OutputTypes';
import uploadImage from '../../functions/uploadImage';
import {sanitizeQuiz} from '../../functions/sanitizer';
import deleteQuiz from '../../functions/deleteQuiz';
import {errors} from '../../functions/errors';

const quizResolver = {
  Query: {
    quizById: async (
      _parent: undefined,
      args: {id: string},
      contextValue: MyContext,
    ): Promise<QuizOut> => {
      if (!contextValue.userdata) throw errors.authUser;
      const quiz = await quizModel.findById(args.id).populate('owner');
      if (!quiz) throw errors.notFound;

      if (quiz.owner.id !== contextValue.userdata.user._id) {
        quiz.questions.forEach((question) => {
          question.answers = [];
        });
      }
      const favorites = await favoritesModel.findOne({
        owner: contextValue.userdata.user._id,
      });
      const quizOut: QuizOut = {
        favorite: false,
        id: quiz.id,
        quiz_name: quiz.quiz_name,
        owner: quiz.owner,
        questions: quiz.questions,
        filename: quiz.filename,
      };
      if (favorites && favorites.items.includes(quizOut.id)) {
        quizOut.favorite = true;
      } else {
        quizOut.favorite = false;
      }
      return quizOut;
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
      args: {input: QuizInput},
      contextValue: MyContext,
    ): Promise<Quiz> => {
      const input = sanitizeQuiz(args.input);
      if (!contextValue.userdata) throw errors.authUser;

      input.owner = contextValue.userdata.user._id;
      const newQuiz = await quizModel.create(input);
      if (!newQuiz) throw errors.notCreated;

      return newQuiz.populate('owner');
    },

    updateQuiz: async (
      _parent: undefined,
      args: {id: string; input: QuizInput},
      contextValue: MyContext,
    ): Promise<Quiz> => {
      const input = sanitizeQuiz(args.input);
      if (!contextValue.userdata) throw errors.authUser;
      const quizUser = await quizModel.findById(args.id).populate('owner');
      if (!quizUser) throw errors.notFound;
      else if (quizUser.owner.id !== contextValue.userdata.user._id)
        throw errors.userNotOwner;

      const quiz = await quizModel
        .findByIdAndUpdate(args.id, input, {
          new: true,
        })
        .populate('owner');
      if (!quiz) throw errors.notCreated;

      return quiz;
    },

    generateQuiz: async (
      _parent: undefined,
      args: {search: string},
      contextValue: MyContext,
    ): Promise<Quiz> => {
      if (!contextValue.userdata) throw errors.authUser;

      console.log('Search :\n', args.search, '\n');
      const {page, imageUrl} = await wikiPage(args.search);
      console.log('Page :\n', page, '\n');
      console.log('Image :\n', imageUrl, '\n');
      const questions = await textToQuestions(page);
      console.log('Questions :\n', questions, '\n');

      let input;
      if (imageUrl !== '') {
        const filename = await uploadImage(
          imageUrl,
          contextValue.userdata.token,
        );
        input = {
          quiz_name: args.search,
          questions: questions,
          owner: contextValue.userdata.user._id,
          filename: filename,
        };
      } else {
        input = {
          quiz_name: args.search,
          questions: questions,
          owner: contextValue.userdata.user._id,
          filename: undefined,
        };
      }

      input = sanitizeQuiz(input);
      const newQuiz = await quizModel.create(input);

      if (!newQuiz) throw errors.notCreated;

      return newQuiz.populate('owner');
    },

    deleteQuiz: async (
      _parent: undefined,
      args: {id: string},
      contextValue: MyContext,
    ): Promise<Quiz> => {
      if (!contextValue.userdata) throw errors.authUser;

      const quizUser = await quizModel.findById(args.id).populate('owner');
      if (!quizUser) throw errors.notFound;
      else if (quizUser.owner.id !== contextValue.userdata.user._id)
        throw errors.userNotOwner;

      const quiz = await deleteQuiz(args.id, contextValue.userdata.token);
      return quiz;
    },
  },
};

export default quizResolver;
