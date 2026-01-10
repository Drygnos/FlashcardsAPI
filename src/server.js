import express from 'express';
import userRoutes from './router/userRouter.js';
import logger from './middleware/logger.js';
import authRoutes from './router/authRouter.js';
import flashcardRoutes from './router/flashcardRouter.js';
import collectionRoutes from './router/collectionRouter.js';
import revisionRoutes from './router/revisionRouter.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger);
app.use(express.json())

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/flashcard', flashcardRoutes);
app.use('/collection', collectionRoutes);

app.use('/revision', revisionRoutes);

app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`);
})