import { Router } from 'express'
import { getFlashcard, deleteFlashcard, createFlashcard } from '../controllers/flashcardController.js';


const router = Router();

router.get('/:id', getFlashcard);
router.delete('/:id', deleteFlashcard);
router.post('/', createFlashcard);


export default router;