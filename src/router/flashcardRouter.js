import { Router } from 'express';
import { getFlashcard, deleteFlashcard, createFlashcard, getFlashcardByCollection, updateFlashcard} from '../controllers/flashcardController.js';
import { createFlashcardSchema, flashcardIdSchema } from './../models/flashcard.js';
import { validateParams, validateBody } from '../middleware/validation.js';
import authenticate, { optionalAuthenticate } from '../middleware/auth.js';


const router = Router();

router.get('/:id', authenticate, validateParams(flashcardIdSchema), getFlashcard);
router.delete('/:id', authenticate, validateParams(flashcardIdSchema), deleteFlashcard);
router.post('/', authenticate, validateBody(createFlashcardSchema), createFlashcard);
router.get('/collection/:idCollection', authenticate, getFlashcardByCollection);
router.put('/:id', authenticate, validateParams(flashcardIdSchema), validateBody(createFlashcardSchema), updateFlashcard);


export default router;