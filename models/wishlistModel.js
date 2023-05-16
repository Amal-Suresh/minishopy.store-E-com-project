const mongoose = require('mongoose')
 

const wishListSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    product:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product'
            },
            price: { 
                type: Number,
                default: 0 
                }
        }
    ],
})
module.exports = mongoose.model('Wishlist',wishListSchema)
