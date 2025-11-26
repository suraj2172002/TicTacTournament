import { Router } from 'express';
import auth from '../middleware/auth.js';
import GameResult from '../models/GameResult.js';

const router = Router();

router.post('/result', auth, async (req, res) => {
  const { levels } = req.body;

  if (!Array.isArray(levels) || levels.length !== 5) {
    return res
      .status(400)
      .json({ message: 'A tournament must include exactly 5 levels' });
  }

  const totalUserWins = levels.filter((lvl) => lvl.userWon).length;
  const totalAiWins = 5 - totalUserWins;
  let champion = 'draw';
  if (totalUserWins > totalAiWins) champion = 'player';
  if (totalAiWins > totalUserWins) champion = 'ai';

  try {
    const result = await GameResult.create({
      user: req.user._id,
      totalUserWins,
      totalAiWins,
      levels,
      champion,
    });

    res.status(201).json({ result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save tournament result' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const history = await GameResult.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load history' });
  }
});

export default router;



