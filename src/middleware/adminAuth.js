import { db } from "../db/database.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";

/**
 * Middleware to verify that the authenticated user is an admin
 * Must be used after the authenticate middleware
 * 
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
export default async function adminAuth(req, res, next) {
    try {
        if (!req.user || !req.user.idUser) {
            return res.status(401).json({ error: 'Unauthorized - No user found' });
        }
        const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.idUser, req.user.idUser))
            .limit(1);
        if (!userData) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (!userData.admin) {
            return res.status(403).json({ error: 'Forbidden - Must be admin' });
        }
        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
