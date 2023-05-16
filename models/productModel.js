const mongoose=require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    bname:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
   quantity:{
        type:Number,
        required:true
   },
   category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Category',
    required:true
   },
   status:{
    type:Boolean,
    default:true
   }
})
module.exports = mongoose.model('Product',productSchema)