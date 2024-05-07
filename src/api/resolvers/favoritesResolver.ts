import {GraphQLError} from 'graphql';
import quizModel from '../models/quizModel';
import {Favorites} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import favoritesModel from '../models/favoritesModel';
import {FavoritesOut} from '../../types/OutputTypes';
import {errors} from '../../functions/errors';

const favoritesResolver = {
  Query: {
    favoritesGet: async (
      _parent: undefined,
      _args: undefined,
      context: MyContext,
    ): Promise<FavoritesOut> => {
      if (!context.userdata) throw errors.authUser;

      const favorites = await favoritesModel.findOne({
        owner: context.userdata.user._id,
      });
      if (!favorites) throw errors.notFound;
      return favorites.populate('items');
    },
  },

  Mutation: {
    favoritesAdd: async (
      _parent: undefined,
      args: {quizId: string},
      context: MyContext,
    ): Promise<Favorites> => {
      if (!context.userdata) throw errors.authUser;
      const favorites = await favoritesModel.findOne({
        owner: context.userdata.user._id,
      });
      if (!favorites) throw errors.notFound;
      const newQuiz = await quizModel.findById(args.quizId);
      if (!newQuiz) throw errors.notFound;
      if (favorites.items.includes(newQuiz._id)) {
        console.log('Quiz already in favorites');
        throw new GraphQLError('Quiz already in favorites', {
          extensions: {code: 'BAD_REQUEST'},
        });
      }
      favorites.items.push(newQuiz._id);
      await favorites.save();
      return favorites.populate('items');
    },

    favoritesRemove: async (
      _parent: undefined,
      args: {quizId: string},
      context: MyContext,
    ): Promise<Favorites> => {
      if (!context.userdata) throw errors.authUser;
      const newQuiz = await quizModel.findById(args.quizId);
      if (!newQuiz) throw errors.notFound;
      const favorites = await favoritesModel.findOne({
        owner: context.userdata.user._id,
      });

      if (!favorites) throw errors.notFound;
      favorites.items = favorites.items.filter(
        (item) => item._id.toString() !== newQuiz._id.toString(),
      );
      await favorites.save();
      return favorites.populate('items');
    },
  },
};

export default favoritesResolver;
