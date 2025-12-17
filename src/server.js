import express from 'express';
import userRoutes from './router/userRouter.js';
import logger from './middleware/logger.js';
import authRoute from './router/authRouter.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger);
app.use(express.json())

app.use('/auth', authRoute);
app.use('/user', userRoutes);

app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`);
})