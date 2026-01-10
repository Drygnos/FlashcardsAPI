import { db } from "../db/database.js";
import { user, collection, revision } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { deleteFlashcardsByCollection } from './flashcardController.js';

/**
 * List all users sorted by creation date (most recent first)
 * 
 * @param {Request} req
 * @param {Response} res
 */
export const listUsers = async (req, res) => {
    try {
        const result = await db
            .select({
                idUser: user.idUser,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                admin: user.admin,
                createdAt: user.createdAt,
            })
            .from(user)
            .orderBy(desc(user.createdAt));
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to fetch users'
        });
    }
}

/**
 * Get user by ID
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }
        const [userData] = await db
            .select({
                idUser: user.idUser,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                admin: user.admin,
                createdAt: user.createdAt,
            })
            .from(user)
            .where(eq(user.idUser, parseInt(userId)))
            .limit(1);
        if (!userData) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to fetch user'
        });
    }
}

/**
 * Delete a user and all related data in following order:
 * - Flashcards' revisions
 * - Collections' flashcards
 * - User's collections
 * - All revision records for the user are deleted
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }
        const userIdInt = parseInt(userId);
        // Check if user exists
        const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.idUser, userIdInt))
            .limit(1);
        if (!userData) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        // Get user's collections
        const userCollections = await db
            .select({ idCollection: collection.idCollection })
            .from(collection)
            .where(eq(collection.idUser, userIdInt));
        // Delete collections' flashcards & their revisions
        for (const coll of userCollections) {
            await deleteFlashcardsByCollection(coll.idCollection);
        }
        // Delete user's collections
        await db
            .delete(collection)
            .where(eq(collection.idUser, userIdInt));
        // Delete user's revisions
        await db
            .delete(revision)
            .where(eq(revision.idUser, userIdInt));
        // Delete user
        await db
            .delete(user)
            .where(eq(user.idUser, userIdInt));
        res.status(200).json({
            message: 'User and all associated data deleted successfully',
            deletedUserId: userIdInt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to delete user'
        });
    }
}