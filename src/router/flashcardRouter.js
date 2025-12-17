import { Router } from 'express'
import { getFlashcard, deleteFlashcard, createFlashcard, getFlashcardByCollection} from '../controllers/flashcardController.js';


const router = Router();

router.get('/:id', getFlashcard);
router.delete('/:id', deleteFlashcard);
router.post('/', createFlashcard);
router.get('/collection/:idCollection', getFlashcardByCollection);


export default router;