import {GraphQLError} from 'graphql';
import quizModel from '../api/models/quizModel';
import resultModel from '../api/models/resultModel';
import favoritesModel from '../api/models/favoritesModel';
import deleteImage from './deleteImage';
import {Quiz} from '../types/DBTypes';

const deleteQuiz = async (id: string, token: string): Promise<Quiz> => {
  const quiz = await quizModel.findByIdAndDelete(id).populate('owner');
  if (!quiz) {
    console.log('Quiz not deleted');
    throw new GraphQLError('Quiz not deleted');
  }
  await resultModel.deleteMany({quiz: id});
  await favoritesModel.updateMany({}, {$pull: {items: id}});
  if (quiz.filename) {
    await deleteImage(quiz.filename, token);
  }
  return quiz;
};

export default deleteQuiz;
