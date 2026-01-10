import express from 'express';
import { getFlashcardsToReview, reviewFlashcard } from '../controllers/revisionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/collection/:idCollection',authMiddleware, getFlashcardsToReview);
router.post('/flashcard/:idFlashcard',authMiddleware, reviewFlashcard);

export default router;