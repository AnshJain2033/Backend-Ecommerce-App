import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import morgan from 'morgan'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoute.js'
import cors from 'cors'
import categoryRoute from './routes/categoryRoute.js'
import productRoutes from './routes/productRoutes.js'
import path from 'path'
dotenv.config()
//rest object
const app = express()
//use of middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, './client/build')))
//connect db
connectDB();
//rouutes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/category', categoryRoute)
app.use('/api/v1/product', productRoutes)
//rest api calling
const PORT = process.env.PORT || 8080
app.use('*', function (req, res) {
    res.sendFile(path.join(__dirname, './client/build/index.html'))
})
app.get("/", (req, res) => {
    res.send("<h1>HELLO</h1>")
})
app.listen(PORT, () => {
    console.log("server setup done".bgGreen.black)
})
