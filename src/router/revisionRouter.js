import express from 'express';
import { getFlashcardsToReview, reviewFlashcard } from '../controllers/revisionController.js';
import authenticate, { optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();


router.get('/collection/:idCollection',authenticate, getFlashcardsToReview);
router.post('/flashcard/:idFlashcard',authenticate, reviewFlashcard);

export default router;