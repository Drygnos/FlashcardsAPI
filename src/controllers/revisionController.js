import { db } from "../db/database.js";
import { revision, flashcard, collection } from "../db/schema.js";
import { eq, and, lte, sql } from "drizzle-orm";

// Revision delays in days for each level
const REVISION_DELAYS = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16
};

// Calculate the next revision date
const calculateNextRevisionDate = (lastDate, level) => {
  const delay = REVISION_DELAYS[level] || 1;
  const date = new Date(lastDate);
  date.setDate(date.getDate() + delay);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Get flashcards to review from a collection
export const getFlashcardsToReview = async (req, res) => {
  try {
    const { idCollection } = req.params;
    const userId = req.user.idUser;

    // Check if the collection exists and if the user has access
    const collectionData = await db
      .select()
      .from(collection)
      .where(eq(collection.idCollection, parseInt(idCollection)))
      .limit(1);

    if (collectionData.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const coll = collectionData[0];

    // Check access rights
    if (!coll.isPublic && coll.idUser !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to this collection' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Retrieve all flashcards from the collection
    const flashcards = await db
      .select()
      .from(flashcard)
      .where(eq(flashcard.idCollection, parseInt(idCollection)));

    // For each flashcard, check if it needs to be reviewed
    const flashcardsToReview = [];

    for (const card of flashcards) {
      // Retrieve the user's revision for this flashcard
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
        // Never reviewed before, needs review
        flashcardsToReview.push({
          ...card,
          level: 0,
          lastDate: null,
          nextRevisionDate: today
        });
      } else {
        const rev = revisionData[0];
        const nextDate = calculateNextRevisionDate(rev.lastDate, rev.level);

        // If the next revision date is today or overdue
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
    res.status(500).json({ error: 'Error while retrieving flashcards to review' });
  }
};

// Review a flashcard
export const reviewFlashcard = async (req, res) => {
  try {
    const { idFlashcard } = req.params;
    const userId = req.user.idUser;
    const today = new Date().toISOString().split('T')[0];

    // Check if the flashcard exists
    const flashcardData = await db
      .select()
      .from(flashcard)
      .where(eq(flashcard.idFlashcard, parseInt(idFlashcard)))
      .limit(1);

    if (flashcardData.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    const card = flashcardData[0];

    // Check if the user has access to this flashcard through its collection
    const collectionData = await db
      .select()
      .from(collection)
      .where(eq(collection.idCollection, card.idCollection))
      .limit(1);

    if (collectionData.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const coll = collectionData[0];

    // Check access rights
    if (!coll.isPublic && coll.idUser !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to this flashcard' });
    }

    // Retrieve the user's current revision
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
      // First review: level 1
      newLevel = 1;
      await db.insert(revision).values({
        idUser: userId,
        idFlashcard: parseInt(idFlashcard),
        lastDate: today,
        level: newLevel
      });
    } else {
      // Increase level by one (maximum level is 5)
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
      message: 'Revision successfully recorded',
      level: newLevel,
      lastDate: today,
      nextRevisionDate: nextRevisionDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error while recording the revision' });
  }
};
