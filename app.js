import dotenv from 'dotenv'

dotenv.config();
import express from 'express';
import web from "./routes/web.js"
import cors from "cors"
import mongoose from 'mongoose';
import connectDb from './config/connectdb.js';




const app= express()

const port= process.env.PORT
const DATABASE_URL= process.env.DATABASE_URL
app.set('view engine','ejs')
app.set('views','./views')
app.use(cors())
app.use(express.urlencoded({extended:true}))


app.use('/', web)


connectDb(DATABASE_URL)

app.listen(port, ()=>{
    console.log(`Server listening at http://localhost:${port}`)
})