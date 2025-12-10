import express from 'express'

const PORT = process.env.PORT || 3000

const app = express()

app.listen(PORT, ()=>{
    console.log(`server running on http://localhst:${PORT}`)
})