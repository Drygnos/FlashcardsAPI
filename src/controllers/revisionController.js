import { db } from "../db/database.js";
import { revision, flashcard, collection } from "../db/schema.js";
import { eq, and, lte, sql } from "drizzle-orm";

// Délais de révision en jours pour chaque niveau
const REVISION_DELAYS = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16
};

// Calculer la prochaine date de révision
const calculateNextRevisionDate = (lastDate, level) => {
  const delay = REVISION_DELAYS[level] || 16;
  const date = new Date(lastDate);
  date.setDate(date.getDate() + delay);
  return date.toISOString().split('T')[0];
};

// Récupérer les flashcards à réviser d'une collection
export const getFlashcardsToReview = async (req, res) => {
  try {
    const { idCollection } = req.params;
    const userId = req.user.idUser;

    // Vérifier que la collection existe et que l'utilisateur y a accès
    const collectionData = await db
      .select()
      .from(collection)
      .where(eq(collection.idCollection, parseInt(idCollection)))
      .limit(1);

    if (collectionData.length === 0) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    const coll = collectionData[0];

    // Vérifier les droits d'accès
    if (!coll.isPublic && coll.idUser !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette collection' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Récupérer toutes les flashcards de la collection
    const flashcards = await db
      .select()
      .from(flashcard)
      .where(eq(flashcard.idCollection, parseInt(idCollection)));

    // Pour chaque flashcard, vérifier si elle doit être révisée
    const flashcardsToReview = [];

    for (const card of flashcards) {
      // Chercher la révision de l'utilisateur pour cette flashcard
      const revisionData = await db
        .select()
        .from(revision)
        .where(
          and(
            eq(revision.idUser, userId),
            eq(revision.idFlashcard, card.idFlashcard)
          )
        )
        .limit(1);

      if (revisionData.length === 0) {
        // Pas encore révisée, à réviser
        flashcardsToReview.push({
          ...card,
          level: 0,
          lastDate: null,
          nextRevisionDate: today
        });
      } else {
        const rev = revisionData[0];
        const nextDate = calculateNextRevisionDate(rev.lastDate, rev.level);

        // Si la date de prochaine révision est passée ou aujourd'hui
        if (nextDate <= today) {
          flashcardsToReview.push({
            ...card,
            level: rev.level,
            lastDate: rev.lastDate,
            nextRevisionDate: nextDate
          });
        }
      }
    }

    res.status(200).json(flashcardsToReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des flashcards à réviser' });
  }
};

// Réviser une flashcard
export const reviewFlashcard = async (req, res) => {
  try {
    const { idFlashcard } = req.params;
    const userId = req.user.idUser;
    const today = new Date().toISOString().split('T')[0];

    // Vérifier que la flashcard existe
    const flashcardData = await db
      .select()
      .from(flashcard)
      .where(eq(flashcard.idFlashcard, parseInt(idFlashcard)))
      .limit(1);

    if (flashcardData.length === 0) {
      return res.status(404).json({ error: 'Flashcard non trouvée' });
    }

    const card = flashcardData[0];

    // Vérifier que l'utilisateur a accès à cette flashcard via sa collection
    const collectionData = await db
      .select()
      .from(collection)
      .where(eq(collection.idCollection, card.idCollection))
      .limit(1);

    if (collectionData.length === 0) {
      return res.status(404).json({ error: 'Collection non trouvée' });
    }

    const coll = collectionData[0];

    // Vérifier les droits d'accès
    if (!coll.isPublic && coll.idUser !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé à cette flashcard' });
    }

    // Récupérer la révision actuelle de l'utilisateur
    const revisionData = await db
      .select()
      .from(revision)
      .where(
        and(
          eq(revision.idUser, userId),
          eq(revision.idFlashcard, parseInt(idFlashcard))
        )
      )
      .limit(1);

    let newLevel;
    
    if (revisionData.length === 0) {
      // Première révision : niveau 1
      newLevel = 1;
      await db.insert(revision).values({
        idUser: userId,
        idFlashcard: parseInt(idFlashcard),
        lastDate: today,
        level: newLevel
      });
    } else {
      // Monter d'un niveau (maximum 5)
      const currentLevel = revisionData[0].level;
      newLevel = Math.min(currentLevel + 1, 5);
      
      await db
        .update(revision)
        .set({
          lastDate: today,
          level: newLevel
        })
        .where(
          and(
            eq(revision.idUser, userId),
            eq(revision.idFlashcard, parseInt(idFlashcard))
          )
        );
    }

    const nextRevisionDate = calculateNextRevisionDate(today, newLevel);

    res.status(200).json({
      message: 'Révision enregistrée avec succès',
      level: newLevel,
      lastDate: today,
      nextRevisionDate: nextRevisionDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la révision' });
  }
};