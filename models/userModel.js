const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: [{
        name:{type:String},
        address:{type:String},
        city:{type:String},
        pin:{type:Number},
        state:{type:String},
        country:{type:String},
        mobile:{type:String},
        status:{type:Boolean,default:false}
    }],
    is_verified: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    },
    token: {
        type: String
    },
    wallet:{
        type:Number,
        default:0
    },
    wallethistory:{
        type:[{
            tdate:{type:Date},
            amount:{type:Number},
            sign:{type:String}
        }]
    }

})


module.exports = mongoose.model('User', userSchema)