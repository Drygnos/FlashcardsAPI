import { Router } from 'express';
import { getFlashcard, deleteFlashcard, createFlashcard, getFlashcardByCollection} from '../controllers/flashcardController.js';
import { createFlashcardSchema, flashcardIdSchema } from './../models/flashcard.js';
import { validateParams, validateBody } from '../middleware/validation.js';


const router = Router();

router.get('/:id', validateParams(flashcardIdSchema), getFlashcard);
router.delete('/:id', validateParams(flashcardIdSchema), deleteFlashcard);
router.post('/', validateBody(createFlashcardSchema), createFlashcard);
router.get('/collection/:idCollection', getFlashcardByCollection);


export default router;