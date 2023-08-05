import mongoose  from 'mongoose'
import colors  from 'colors'
const connectDB= async ()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URL)
        console.log(`Database connected to ${conn.connection.host}`.bgMagenta.black)
    } catch (error) {
        console.log(`Failed to connect to database ${error}`.bgRed.white)
    }
}
export default connectDB