import { Router } from 'express'
import { getAllCollections, createCollection, deleteCollection, getCollection, getOwnedCollections } from '../controllers/collectionController.js'
import authenticate, { optionalAuthenticate } from '../middleware/auth.js';
import { createCollectionSchema, collectionIdSchema } from './../models/collection.js'
import { validateParams, validateBody } from '../middleware/validation.js';

const router = Router();

router.post('/', authenticate, validateBody(createCollectionSchema), createCollection);
router.get('/', optionalAuthenticate, getAllCollections);
router.get('/own', optionalAuthenticate, getOwnedCollections);
router.get('/:id', optionalAuthenticate, validateParams(collectionIdSchema), getCollection);
router.delete('/:id', authenticate, validateParams(collectionIdSchema), deleteCollection);

export default router;