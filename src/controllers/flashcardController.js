import { db } from "../db/database.js";
import { flashcard, collection, revision } from "../db/schema.js";
import { eq } from "drizzle-orm";




export const getFlashcard = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.select().from(flashcard).where(eq(flashcard.idFlashcard, Number(id)));;
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Failed to fetch flashcard'
        });
    }
}


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



//Il faut supprimer les révisions d'abord à cause des contraintes de clés étrangères donc ça marche pas pour l'instant ;)
export const deleteFlashcard = async (req, res) => {
/*    const { id } = req.params;

    try {
        const result = await db.select().from(flashcard).where(eq(flashcard.idFlashcard, Number(id)));
        if (result.length === 0) {
            return res.status(404).json({ error: "Flashcard not found" });
        }
        
        await db.delete(flashcard).where(eq(flashcard.idFlashcard, Number(id)));

        res.json({ message: "Flashcard deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete flashcard" });
    }*/
};

//TODO: Vérifier que l'utilisateur a le droit de supprimer la flashcard (propriétaire de la collection)




export const createFlashcard = async (req, res) => {
    try {
        const result = await db.insert(flashcard).values(req.body).returning();
        res.status(201).json({
            message: 'Flashcard created successfully',
            question: result
        });
    } catch (error) {
        res.status(500).send({
            error: 'Failed to create flashcard'
        })
    }
}




export const getFlashcardByCollection = async (req, res) => {
    const { idCollection } = req.params;
    const user = req.user;

    try {
        const col = await db
            .select().from(collection).where(eq(collection.idCollection, Number(idCollection)));

        if (col.length === 0) {
            return res.status(404).json({ error: "Collection not found" });
        }

        /*const hasAccess =

        if (!hasAccess) {
            return res.status(403).json({ error: "Access denied" });
        }
        */
       //TODO: Vérifier que l'utilisateur a accès à la collection (publique ou propriétaire)

        const cards = await db
            .select()
            .from(flashcard)
            .where(eq(flashcard.idCollection, Number(idCollection)));

        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch flashcards" });
    }
};