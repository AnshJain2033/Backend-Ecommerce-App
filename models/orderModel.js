import mongoose from "mongoose";
const orderSchema = mongoose.Schema({
    products: [{
        type: mongoose.ObjectId,
        ref: 'product'
    },],
    payment: {},
    buyer: {
        type: mongoose.ObjectId,
        ref: 'users'
    },
    status: {
        type: String,
        default: 'Not Processed',
        enum: ['Not Processed', 'Processing', 'Cancel', 'Delivered', 'Shipped'],
    },
}, { timestamps: true })
export default mongoose.model('Order', orderSchema)