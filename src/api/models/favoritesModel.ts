import mongoose from 'mongoose';
import {Favorites} from '../../types/DBTypes';

const Favorites = new mongoose.Schema<Favorites>({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },
  ],
});

export default mongoose.model<Favorites>('Favorites', Favorites);
