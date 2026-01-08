import { db } from "../db/database.js";
import { collection } from "../db/schema.js";
import {eq, or} from 'drizzle-orm';


/**
 * 
 * @param {request} req 
 * @param {response} res
 */
export const createCollection = async (req, res) => {
    try {
        const { title, description, isPublic } = req.body;

        const ownerId = req.user?.idUser;
        if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

        const result = await db
            .insert(collection)
            .values({
                title,
                description,
                isPublic,
                idUser: ownerId
            }).returning({
                id: collection.idCollection,
                title: collection.title,
                description: collection.description,
                isPublic: collection.isPublic,
                idUser: collection.idUser
            });
        res.status(201).json({
            message: 'collection created successfully',
            collection: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Failed to create collection'
        })
    }
}


/**
 * 
 * @param {request} req 
 * @param {response} res
 */
export const getAllCollections = async (req, res) => {
    try {
        // require authenticated user
        const userId = req.user?.idUser ?? null;
        if (!userId) {
            return res.status(401).send({ error: 'You need to be authenticated to retrieve collections' });
        }
        const result = await db
            .select()
            .from(collection)
            .where(
                or(
                    eq(collection.isPublic, true),
                    eq(collection.idUser, Number(userId))
                )
            )
            .orderBy('title', 'asc');
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Failed to fetch collections'
        });
    }
}


/**
 * 
 * @param {request} req 
 * @param {response} res
 */
export const getCollection = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db
            .select()
            .from(collection)
            .where(
                eq(collection.idCollection, Number(id))).get();
        if (!result){
            res.status(404).send({
                error: 'collection not found'
            });
        }
        // Check if private and authenticated user doesn't own it
        const userId = req.user?.idUser ?? null;
        if (!result.isPublic && result.idUser !== userId) {
            return res.status(403).send({
                error: 'Forbidden: You are not the owner of this private collection'
            });
        }
        res.status(200).send({
            message: `collection ${id} fetched successfully`,
            collection: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch collection' });
    }
}


/**
 * 
 * @param {request} req 
 * @param {response} res
 */
export const getOwnedCollections = async (req, res) => {
    try {
        const userId = req.user?.idUser ?? null;
        if (!userId) {
            return res.status(403).send({
                error: 'Forbidden: You are unauthenticated, therefore you cannot access owned collections'
            });
        }
        const result = await db
            .select()
            .from(collection)
            .where(eq(collection.idUser, Number(userId)))
            .orderBy('title', 'asc');
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Failed to fetch collections'
        });
    }
}



/**
 * 
 * @param {request} req 
 * @param {response} res
 */
export const deleteCollection = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.delete(collection).where(eq(collection.idCollection, Number(id))).returning();
        if (!result || result.length === 0){
            return res.status(404).send({ error: 'collection not found' });
        }
        res.status(200).send({
            message: `collection ${id} deleted successfully`
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to delete collection' });
    }
}