import mongoose from 'mongoose';
import {Result} from '../../types/DBTypes';

const Result = new mongoose.Schema<Result>({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
});

export default mongoose.model<Result>('Result', Result);
