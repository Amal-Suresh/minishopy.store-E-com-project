const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    subtitle:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    discription:{
        type:String,
        required:true,
    },
    url:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:false
    }
})

module.exports =mongoose.model('Banner',bannerSchema);