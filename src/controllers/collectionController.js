import { db } from "../db/database.js";
import { collection } from "../db/schema.js";
import {eq, or, like, and} from 'drizzle-orm';


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
        //extract serch query param
        const { search } = req.query;
        let query = db.select().from(collection);
        // if search param provided, apply search on title field
        if (search) {
            query = query.where(
                and(
                    or(
                        eq(collection.isPublic, true),
                        eq(collection.idUser, Number(userId))
                    ),
                    like(collection.title, `%${search}%`)
                )
            );
        // if no search param provided, filter on public or owned collections
        } else {
            query = query.where(
                or(
                    eq(collection.isPublic, true),
                    eq(collection.idUser, Number(userId))
                )
            );
        }
        const result = await query.orderBy('title', 'asc');
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
        // check if private and authenticated user doesn't own it
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
export const updateCollection = async (req, res) => {
    const { id } = req.params;
    const { title, description, isPublic } = req.body;
    
    try {
        // verify user is authenticated
        const userId = req.user?.idUser;
        if (!userId) {
            return res.status(401).send({ error: 'Unauthorized, you need to be authenticated to edit a collection' });
        }
        // check if collection exists 
        const existingCollection = await db
            .select()
            .from(collection)
            .where(eq(collection.idCollection, Number(id)))
            .get();           
        if (!existingCollection) {
            return res.status(404).send({ error: 'Collection not found' });
        }
        // verify user owns the collection
        if (existingCollection.idUser !== userId) {
            return res.status(403).send({
                error: 'Forbidden: You are not the owner of this collection'
            });
        }
        // update collection with provided fields (only update fields that were provided)
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        const result = await db
            .update(collection)
            .set(updateData)
            .where(eq(collection.idCollection, Number(id)))
            .returning({
                id: collection.idCollection,
                title: collection.title,
                description: collection.description,
                isPublic: collection.isPublic,
                idUser: collection.idUser
            });
        res.status(200).send({
            message: `Collection ${id} updated successfully`,
            collection: result[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to update collection' });
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