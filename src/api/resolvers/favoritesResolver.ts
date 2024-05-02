import {GraphQLError} from 'graphql';
import quizModel from '../models/quizModel';
import {Favorites} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import favoritesModel from '../models/favoritesModel';
import {FavoritesOut} from '../../types/OutputTypes';

const favoritesResolver = {
  Query: {
    favoritesGet: async (
      _parent: undefined,
      _args: undefined,
      context: MyContext,
    ): Promise<FavoritesOut> => {
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }

      const favorites = await favoritesModel.findOne({
        owner: context.userdata.user._id,
      });
      if (!favorites) {
        console.log('Favorites not found');
        throw new GraphQLError('Favorites not found');
      }
      return favorites.populate('items');
    },
  },

  Mutation: {
    favoritesAdd: async (
      _parent: undefined,
      args: {quizId: string},
      context: MyContext,
    ): Promise<Favorites> => {
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }
      const favorites = await favoritesModel.findOne({
        owner: context.userdata.user._id,
      });
      if (!favorites) {
        console.log('Favorites not found');
        throw new GraphQLError('Favorites not found');
      }
      const newQuiz = await quizModel.findById(args.quizId);
      if (!newQuiz) {
        console.log('Quiz not found');
        throw new GraphQLError('Quiz not found');
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
      if (!context.userdata) {
        console.log('User not authenticated');
        throw new GraphQLError('User not authenticated', {
          extensions: {code: 'UNAUTHENTICATED'},
        });
      }
      const favorites = await favoritesModel.findOne({
        owner: context.userdata.user._id,
      });
      if (!favorites) {
        console.log('Favorites not found');
        throw new GraphQLError('Favorites not found');
      }
      const newQuiz = await quizModel.findById(args.quizId);
      if (!newQuiz) {
        console.log('Quiz not found');
        throw new GraphQLError('Quiz not found');
      }
      favorites.items = favorites.items.filter(
        (item) => item._id.toString() !== newQuiz._id.toString(),
      );
      await favorites.save();
      return favorites.populate('items');
    },
  },
};

export default favoritesResolver;
