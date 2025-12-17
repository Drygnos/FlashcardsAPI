import { Router } from 'express'
import { getAllCollections, createCollection, deleteCollection } from '../controllers/collectionController.js'
import logger from './../middleware/logger.js'
import { createCollectionSchema, collectionIdSchema } from './../models/collection.js'
import { validateParams, validateBody } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = Router();

router.use(authenticateToken);

router.get('/', logger, getAllCollections);

router.post('/', validateBody(createQuestionSchema), createCollection)

router.delete('/:id', validateParams(collectionIdSchema), deleteCollection)

export default router;