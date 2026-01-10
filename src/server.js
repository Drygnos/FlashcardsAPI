import express from 'express';
import adminRoutes from './router/adminRouter.js';
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
app.use('/admin', adminRoutes);
app.use('/collection', collectionRoutes);
app.use('/flashcard', flashcardRoutes);
app.use('/revision', revisionRoutes);

app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`);
})