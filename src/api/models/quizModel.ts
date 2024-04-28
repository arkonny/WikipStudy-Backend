import mongoose from 'mongoose';
import {Quiz, User} from '../../types/DBTypes';

type UserRole = User & {role: 'user' | 'admin'};

const userSchema = new mongoose.Schema<UserRole>({
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

mongoose.model<UserRole>('User', userSchema);

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
    default: undefined,
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
    required: false,
  },
});

export default mongoose.model<Quiz>('Quiz', quizModel);
