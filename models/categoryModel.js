import mongoose from "mongoose";
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        reuired: true,
        unique: true
    },
    slug: {
        type: String,
        lowercase: true,
    }
})
export default mongoose.model('category', categorySchema)