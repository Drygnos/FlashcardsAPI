import express from 'express'
import userRoutes from './router/userRouter.js'

const PORT = process.env.PORT || 3000

const app = express()

app.use('/user', userRoutes);

app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`)
})