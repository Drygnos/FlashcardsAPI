import { db } from "../db/database.js";
import { collection } from "../db/schema.js";
import {eq} from 'drizzle-orm';

export const getAllCollections = async (req, res) => {
    try {
        const result = await db.select().from(collection).orderBy('title', 'asc');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send({
            error: 'Failed to fetch collections'
        });
    }
}

export const getCollection = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.select().from(collection).where(eq(collection.idCollection, id));
        if (!result){
            res.status(404).send({
                error: 'collection not found'
            });
        }
        res.status(200).send({
            message: `collection ${id} fetched successfully`,
            collection: result
        });
    } catch (error) {
        console.error(error);
        res.status(500);
    }
}


export const createCollection = async (req, res) => {
    try {
        const { title, description, isPublic, idUser } = req.body;
        const result = await db
            .insert(collection)
            .values({
                title,
                description,
                isPublic,
                idUser
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
export const deleteCollection = async (req, res) => {
    const { id } = req.params;
    try {
        await db.delete(collection).where(eq(collection.id, id)).returning()
        if (!result){
            res.status(404).send({
                error: 'collection not found'
            });
        }
        res.status(200).send({
            message: `collection ${id} deleted successfully`
        });
    } catch (error) {
        res.status()
    }
}