import mongoose from "mongoose"
const userSchema = mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    Address:{
        type:String,
        required:true

    },
    phoneNumber:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
        
    },
    answer:{
        type:String,
        required:true,
        
    },
    role:{
        type:Number,
        defualt:"0",
        
    }
    
    
    

},{timestamps:true})
export default mongoose.model('users',userSchema)