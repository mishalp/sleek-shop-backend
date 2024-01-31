import express from 'express'
import productRoute from './routes/product.js'
import shopRoute from './routes/shop.js'
import mongoose from 'mongoose';
import cloudinary from 'cloudinary'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { errorHandler } from './utils/utils.js';

//Databse connection
mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGO).then(() => {
    console.log('db connected');
}).catch((error) => {
    console.log(error);
})

//cloudinary connection
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const app = express()

//middlewares
app.use(cors({
    origin: ['http://localhost:5173',],
    credentials: true
}))
// app.use(express.json())
app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb' }));
app.use(cookieParser())

//routes
app.use('/product', productRoute)
app.use('/shop', shopRoute)


//error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    console.log(err);
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})

app.listen(process.env.PORT, () => {
    console.log("Serever is started at port " + process.env.PORT);
})