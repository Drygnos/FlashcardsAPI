import { db } from "../db/database.js";
import { flashcard, collection, revision } from "../db/schema.js";
import { eq } from "drizzle-orm";




/**
 * Get a single flashcard by its ID
 * @param {request} req
 * @param {response} res
 */
export const getFlashcard = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.select().from(flashcard).where(eq(flashcard.idFlashcard, Number(id)));
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Flashcard non trouvée' });
        }
        
        res.status(200).json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Failed to fetch flashcard'
        });
    }
}


/**
 * Delete all flashcards belonging to a collection
 * Also deletes all associated revisions
 * (used when deleting a collection)
 *
 * @param {number} idCollection
 */
export const deleteFlashcardsByCollection = async (idCollection) => {
    // deletes revisions for flashcards in the collection, then the flashcards
    const collectionId = Number(idCollection);
    const flashcardsInCollection = await db
        .select({ id: flashcard.idFlashcard })
        .from(flashcard)
        .where(eq(flashcard.idCollection, collectionId));

    for (const card of flashcardsInCollection) {
        await db.delete(revision).where(eq(revision.idFlashcard, card.id));
    }

    await db.delete(flashcard).where(eq(flashcard.idCollection, collectionId));
};


/**
 * Delete a single flashcard
 * Only the owner of the collection can delete it
 *
 * @param {request} req
 * @param {response} res
 */
export const deleteFlashcard = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.idUser;

    try {
        // Verify that the flashcard exists
        const flashcardData = await db
            .select()
            .from(flashcard)
            .where(eq(flashcard.idFlashcard, Number(id)));

        if (flashcardData.length === 0) {
            return res.status(404).json({ error: "Flashcard not found" });
        }

        const card = flashcardData[0];

        // Verify that the user is the owner of the collection to which the flashcard belongs
        const collectionData = await db
            .select()
            .from(collection)
            .where(eq(collection.idCollection, card.idCollection));

        if (collectionData.length === 0) {
            return res.status(404).json({ error: "Collection not found" });
        }

        if (collectionData[0].idUser !== userId) {
            return res.status(403).json({ error: "Access denied. Only the collection owner can delete flashcards" });
        }

        // Delete associated revisions first
        await db.delete(revision).where(eq(revision.idFlashcard, Number(id)));

        // Then delete the flashcard
        await db.delete(flashcard).where(eq(flashcard.idFlashcard, Number(id)));

        res.json({ message: "Flashcard deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete flashcard" });
    }
};


/**
 * Create a new flashcard
 * The flashcard can only be created in a collection owned by the user
 *
 * @param {request} req
 * @param {response} res
 */
export const createFlashcard = async (req, res) => {
    try {
        const userId = req.user.idUser;
        const { idCollection } = req.body;

        // Verify that the collection exists and belongs to the user
        const collectionData = await db
            .select()
            .from(collection)
            .where(eq(collection.idCollection, Number(idCollection)));

        if (collectionData.length === 0) {
            return res.status(404).json({ error: "Collection not found" });
        }
        console.log(collectionData);
        console.log(userId);

        if (collectionData[0].idUser !== userId) {
            return res.status(403).json({ error: "Access denied. You can only create flashcards in your own collections" });
        }

        const result = await db.insert(flashcard).values(req.body).returning();
        
        res.status(201).json({
            message: 'Flashcard created successfully',
            flashcard: result[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Failed to create flashcard'
        })
    }
}



/**
 * Get all flashcards belonging to a collection
 * Public collections are accessible by everyone
 * Private collections are only accessible by their owner
 *
 * @param {request} req
 * @param {response} res
 */
export const getFlashcardByCollection = async (req, res) => {
    const { idCollection } = req.params;
    const userId = req.user.idUser;

    try {
        // Verify that the collection exists
        const col = await db
            .select()
            .from(collection)
            .where(eq(collection.idCollection, Number(idCollection)));

        if (col.length === 0) {
            return res.status(404).json({ error: "Collection not found" });
        }

        const collectionData = col[0];

        // Verify access rights
        const hasAccess = collectionData.isPublic || collectionData.idUser === userId;

        if (!hasAccess) {
            return res.status(403).json({ error: "Access denied. This collection is private" });
        }

        // Retrieve flashcards in the collection
        const cards = await db
            .select()
            .from(flashcard)
            .where(eq(flashcard.idCollection, Number(idCollection)));

        res.json(cards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch flashcards" });
    }
};


/**
 * Update a flashcard
 * Only the owner of the collection can update it
 *
 * @param {request} req
 * @param {response} res
 */
export const updateFlashcard = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.idUser;
    const { recto, verso, rectoUrl, versoUrl } = req.body;

    try {
        // Verify that the flashcard exists
        const flashcardData = await db
            .select()
            .from(flashcard)
            .where(eq(flashcard.idFlashcard, Number(id)));

        if (flashcardData.length === 0) {
            return res.status(404).json({ error: "Flashcard not found" });
        }

        const card = flashcardData[0];

        // Verify that the user is the owner of the collection to which the flashcard belongs
        const collectionData = await db
            .select()
            .from(collection)
            .where(eq(collection.idCollection, card.idCollection));

        if (collectionData.length === 0) {
            return res.status(404).json({ error: "Collection not found" });
        }

        if (collectionData[0].idUser !== userId) {
            return res.status(403).json({ error: "Access denied. Only the collection owner can update flashcards" });
        }

        // Build the update data object
        const updateData = {};
        if (recto !== undefined) updateData.recto = recto;
        if (verso !== undefined) updateData.verso = verso;
        if (rectoUrl !== undefined) updateData.rectoUrl = rectoUrl;
        if (versoUrl !== undefined) updateData.versoUrl = versoUrl;

        // Verify that there is at least one field to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // Update the flashcard
        const result = await db
            .update(flashcard)
            .set(updateData)
            .where(eq(flashcard.idFlashcard, Number(id)))
            .returning();

        res.json({
            message: "Flashcard updated successfully",
            flashcard: result[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update flashcard" });
    }
};