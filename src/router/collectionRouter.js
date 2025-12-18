import { Router } from 'express'
import { getAllCollections, createCollection, deleteCollection, getCollection } from '../controllers/collectionController.js'
import logger from './../middleware/logger.js'
import { createCollectionSchema, collectionIdSchema } from './../models/collection.js'
import { validateParams, validateBody } from '../middleware/validation.js';
//import { authenticateToken } from '../middleware/authenticateToken.js';

const router = Router();

//router.use(authenticateToken);

router.get('/', logger, getAllCollections);

router.get('/:id', validateParams(collectionIdSchema), getCollection);

router.post('/', validateBody(createCollectionSchema), createCollection);

router.delete('/:id', validateParams(collectionIdSchema), deleteCollection);

export default router;