const mongoose = require('mongoose')


const orderSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true

    },
    product: [{
        productId: { 
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Product',
             required: true 
            },
        quantity: { 
             type: Number, 
             default: 1 
        },
        image:{
            type:Array
        }, 
        price: { 
            type: Number,
            default: 0 
            },
        totalPrice: { type: Number,
             default: 0
             },
      }],
    finalAmount:{
        type:Number,
        default:0
    },
    discount:{
        type:Number,
        default:0
    },
    deliveryCharge:{
        type:Number,
        default:0
    },
    address:{
        name:{type:String,required:true},
        address:{type:String,required:true},
        city:{type:String,required:true},
        pin:{type:Number,required:true},
        state:{type:String,required:true},
        country:{type:String,required:true},
        mobile:{type:String,required:true}
    },
    paymentMethod:{
        type:String,
        required:true
    },
    orderStatus:{
        type:String,
        default:"ordered"
    },
    date:{
        type:Date,
    },
},
{
    timestamps:true
}
)

module.exports = mongoose.model("Order",orderSchema);

