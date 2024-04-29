import mongoose from 'mongoose';
import {Report} from '../../types/DBTypes';

const Report = new mongoose.Schema<Report>({
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: false,
  },
});

export default mongoose.model<Report>('Report', Report);
