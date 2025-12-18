import { db } from "./database.js";
import { user, flashcard, revision, collection } from "./schema.js";
import bcrypt from 'bcrypt';


async function seed() {
    try {
        console.log("Seeding database...");

        await db.delete(revision);
        await db.delete(flashcard);
		await db.delete(collection);
        await db.delete(user);

        

        const hashedPassword1 = await bcrypt.hash('password', 10)
		const hashedPassword2 = await bcrypt.hash('1234', 12)


        const seedUser = [
			{
				email: "clementcatel@unicaen.fr",
				name: 'Clément',
                lastName: 'Catel',
				password: hashedPassword1,
                admin: 0
			},
			{
				email: "michelfrein@unicaen.fr",
				name: 'Michel',
                lastName: 'Frein',
				password: hashedPassword2,
                admin: 0
			}
		];


        const [user1, user2] = await db.insert(user)
            .values(seedUser)
            .returning();


        const seedCollection = [
            {
                title: "Histoire de France",
                description: "Flashcards sur l'histoire de France du Moyen Âge à nos jours.",
                isPublic: 1,
                idUser: user1.idUser
            },
            {
                title: "Biologie Cellulaire",
                description: "Flashcards sur la biologie cellulaire pour les étudiants en L1.",
                isPublic: 1,
                idUser: user2.idUser
            }
        ];

        const [collection1, collection2] = await db.insert(collection)
            .values(seedCollection)
            .returning();


        const seedFlashcard = [
             {
                recto: "Quelle est la date du sacre de Charlemagne ?",
                verso: "25 décembre 800",
                rectoUrl: null,
                versoUrl: "https://fr.wikipedia.org/wiki/Charlemagne",
                idCollection: collection1.idCollection
            },
            {
                recto: "Quelle est la fonction des mitochondries ?",
                verso: "Produire de l'énergie (ATP) pour la cellule.",
                rectoUrl: null,
                versoUrl: "https://fr.wikipedia.org/wiki/Mitochondrie",
                idCollection: collection2.idCollection
            }
		];

        const [flashcard1, flashcard2] = await db.insert(flashcard)
            .values(seedFlashcard)
            .returning();

        const seedRevision = [
            {
                idUser: user1.idUser,
                idFlashcard: flashcard1.idFlashcard,
                lastDate: new Date().toISOString().split('T')[0],
                level: 1
            },
            {
                idUser: user2.idUser,
                idFlashcard: flashcard2.idFlashcard,
                lastDate: new Date().toISOString().split('T')[0],
                level: 1
            }
        ];


        await db.insert(revision).values(seedRevision);

        console.log("Database seeded successfully");
    } catch (error) {
        console.log("Error seeding database : ", error);
    }
}

seed()