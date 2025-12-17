import { db } from "../db/database.js";
import { flashcard } from "../db/schema.js";

export const getFlashcard = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.select().from(flashcard);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Failed to fetch flashcard'
        });
    }
}


export const deleteFlashcard = async (req, res) => {

}

export const createFlashcard = async (req, res) => {
    try {
        const result = await db.insert(flashcard).values(req.body).returning();
        res.status(201).json({
            message: 'Question created successfully',
            question: result
        });
    } catch (error) {
        res.status(500).send({
            error: 'Failed to create question'
        })
    }
}