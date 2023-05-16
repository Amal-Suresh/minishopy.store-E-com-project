const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    whoUsed:{
        type:Array,
    },
    minPurchase:{
        type:Number,
        required:true,
    },
    maxDiscount:{
        type:Number,
        required:true,
    },
    expireDate:{
        type:Date,
        default:false
    },
    status:{
        type:Boolean,
        default:true
    },
    limit:{
        type:Number,
        required:true
    }
})
module.exports =mongoose.model('Coupon',couponSchema);

// const couponCollection = new mongoose.model('Coupon',couponSchema);
// module.exports = couponCollection