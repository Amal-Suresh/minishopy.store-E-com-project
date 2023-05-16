const mongoose = require('mongoose')


const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true
    },
    product: [{
        productId: { 
             type: mongoose.Schema.Types.ObjectId,
             ref: 'Product',
             required: true 
            },
        image:{
                type:Array,
            },
        quantity: { 
             type: Number, 
             default: 1 
        },
        price: { 
            type: Number,
            default: 0 
            },
        totalPrice: { type: Number,
             default: 0
             },
      }],
})

module.exports = mongoose.model("Cart", cartSchema)
