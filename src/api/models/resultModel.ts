// mongoose schema for quiz
// intface User is located in src/interfaces/Quiz.ts

import mongoose from 'mongoose';
import {Result} from '../../types/DBTypes';

const Result = new mongoose.Schema<Result>({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  user: {
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
