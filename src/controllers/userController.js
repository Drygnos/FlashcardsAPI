import { db } from "../db/database.js";
import { user } from "../db/schema.js";

export const getAllUsers = async (req, res) => {
    try {
        const result = await db.select().from(user);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Failed to fetch user'
        });
    }
}