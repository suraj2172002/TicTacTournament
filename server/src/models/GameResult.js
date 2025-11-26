import mongoose from 'mongoose';

const levelResultSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true },
    userWon: { type: Boolean, required: true },
    aiDifficulty: { type: String, required: true },
  },
  { _id: false }
);

const gameResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalUserWins: { type: Number, required: true },
    totalAiWins: { type: Number, required: true },
    levels: {
      type: [levelResultSchema],
      validate: [(val) => val.length === 5, 'A tournament must have 5 levels.'],
    },
    champion: {
      type: String,
      enum: ['player', 'ai', 'draw'],
      required: true,
    },
  },
  { timestamps: true }
);

const GameResult = mongoose.model('GameResult', gameResultSchema);

export default GameResult;



