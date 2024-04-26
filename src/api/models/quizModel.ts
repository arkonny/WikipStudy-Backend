// mongoose schema for quiz
// intface User is located in src/interfaces/Quiz.ts

import mongoose from 'mongoose';
import {Quiz, User} from '../../types/DBTypes';

const userSchema = new mongoose.Schema<User>({
  user_name: {
    type: String,
    minlength: [3, 'Username must be at least 3 characters'],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: [4, 'Password must be at least 4 characters'],
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
  },
});

mongoose.model<User>('User', userSchema);

const Question = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['multiple', 'single'],
  },
  options: {
    type: [String],
  },
  answers: {
    type: [String],
    required: true,
  },
});

const quizModel = new mongoose.Schema<Quiz>({
  quiz_name: {
    type: String,
    required: true,
  },
  questions: {
    type: [Question],
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
});

export default mongoose.model<Quiz>('Quiz', quizModel);
