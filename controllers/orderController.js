const Order = require("../models/orderModel")
const User = require("../models/userModel")
const Cart = require("../models/cartModel")
const Coupon = require("../models/couponModel")
require("dotenv").config()
const Razorpay = require("razorpay")
const { query } = require("express")
const Product = require('../models/productModel')

var instance = new Razorpay({ key_id: process.env.RAZOR_KEYID, key_secret:process.env.RAZOR_SECRET })

const placeOrder = async (req, res) => {
    try {

        const userId = req.session.userDatas._id
        const totalAmount = req.body.totalamount
        const discount =  req.session.discount?req.session.discount:0
        const user = await User.findOne({ _id: userId });
        const add =  user.address.filter(address => address.status);
        const payment = req.body.payment
        const [{
            name,
            address,
            city,
            pin,
            state,
            country,
            mobile,
        }] = add
        req.session.payment = payment
        req.session.totalAmount = totalAmount
        console.log(req.session.totalAmount);

        const addres = {
            name,
            address,
            mobile,
            country,
            state,
            city,
            pin
        }

        req.session.address = addres
        const userCart = await Cart.findOne({ user: userId }).populate('product').lean()
        if (payment == "COD") {
            console.log('entering to the cod');
            
            if (req.session.couponId != null) {
                discount = req.session.discount
            }
            const order = new Order({
                user: userId,
                product: userCart.product,
                finalAmount: totalAmount,
                discount: discount,
                address: addres,
                paymentMethod: payment,
                date: new Date()
            })

            const saveOrder = await order.save()
            if(req.session.coupon){

               
                const insertUser = await Coupon.findByIdAndUpdate(req.session.couponId,
                    {
                    $inc:{limit:-1},
                    $push:{whoUsed:userId}
                    })
                
                    req.session.coupon = null
                    req.session.couponId = null
                    req.session.discount = null
            }

            req.session.userOrder = order._id
            Promise.all(userCart.product.map(({productId,quantity}) => {
                return Product.findOneAndUpdate({_id:productId},{$inc:{quantity:-quantity}})
              }))
              

            const OrderData = await Order.find({_id:order._id}).lean("product").lean()


            username = req.session.userDatas.fname
            if (saveOrder) {
                console.log("cod success");
                const removeCart = await Cart.deleteOne({ user: userId })

                res.json({ url: 'ordersuccess' });
            }

        } else if(payment == "Online"){
            console.log('entering to the online');
            //payment integration
            const { v4: uuidv4 } = require('uuid')
            const receiptId = uuidv4()


            const price = parseInt(totalAmount);

            const option = {
                amount: price * 100,
                currency: "INR",
                receipt: receiptId,
            }

            instance.orders.create(option, (err, order) => {

                console.log(order)
                if (err) {
                    res.json({ error: err })
                } else {
                    res.json({ razorpayDetails: order })
                }
            })

        }else if(payment == "Wallet"){
            console.log("reached wallet");

           const userId = req.session.userDatas._id
           const userData = await User.findById(userId).lean()
           if(userData.wallet>= req.session.totalAmount){

            const discount =  req.session.discount?req.session.discount:0
           const order = new Order({
               user: userId,
               product: userCart.product,
               finalAmount:   req.session.totalAmount,
               discount: discount,
               address: req.session.address,
               paymentMethod:  req.session.payment ,
               date: new Date()
           })

           const saveOrder = await order.save()

           Promise.all(userCart.product.map(({productId,quantity}) => {
            return Product.findOneAndUpdate({_id:productId},{$inc:{quantity:-quantity}})
          }))
          

           const subtotal =  req.session.totalAmount
           const newWallet = userData.wallet - req.session.totalAmount
           await User.updateOne(
            {_id:userId},
            {
                $set:{wallet:newWallet},
                $push:{wallethistory:{tdate:new Date(),amount: subtotal,sign:"debit"}}
            }
           )

           if(req.session.coupon){
            const insertUser = await Coupon.findByIdAndUpdate(req.session.couponId,
                {
                $inc:{limit:-1},
                $push:{whoUsed:userId}
                })
            
                req.session.coupon = null
                req.session.couponId = null
                req.session.discount = null
        }
           req.session.userOrder = order._id
           username = req.session.userDatas.fname
           if (saveOrder) {
               console.log("wallet payment success");
               const removeCart = await Cart.deleteOne({ user: userId })
               

               res.json({ url: 'ordersuccess' });
           }

        }
        else{
            res.json({ lowfund: 'insufficient wallet amount' });
        }
    }

    } catch (error) {
        console.log(error.message);
    }
}


const success = async (req, res) => {
    try {
        if (req.session.userDatas) {

            console.log("sesssion true", req.body)
            const paymentDetails = req.body

            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', '8fEDc3nKHEBt1muQWjodKhoa')
            hmac.update(paymentDetails['payment[razorpay_order_id]'] + '|' + paymentDetails['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == paymentDetails['payment[razorpay_signature]']) {
                console.log("payment successss");
                const userId = req.session.userDatas._id
                const userCart = await Cart.findOne({ user: userId }).populate('product').lean()

                const discount =  req.session.discount?req.session.discount:0
                const order = new Order({
                    user: userId,
                    product: userCart.product,
                    finalAmount: req.session.totalAmount,
                    discount:discount,
                    address: req.session.address,
                    paymentMethod:"Online",
                    date: new Date()
                })
                const saveOrder = await order.save()

                Promise.all(userCart.product.map(({productId,quantity}) => {
                    return Product.findOneAndUpdate({_id:productId},{$inc:{quantity:-quantity}})
                  }))
                  
                if(req.session.coupon){
                    const insertUser = await Coupon.findByIdAndUpdate(req.session.couponId,
                        {
                        $inc:{limit:-1},
                        $push:{whoUsed:userId}
                        })
                        req.session.coupon = null
                        req.session.couponId = null
                        req.session.discount = null
                }
                req.session.userOrder = order._id
                username = req.session.userDatas.fname

                if (saveOrder) {
                  const removeCart = await Cart.deleteOne({ user: userId })
                    res.json({ url: 'ordersuccess' });
                }
            } else {
                console.log("failed");
            }
        } else {
            redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const userCancelOrder = async(req,res)=>{
    try {
        const orderId = req.query.id
        const OrderData =  await Order.findOne({_id:orderId}).populate("product.productId").lean()
        Promise.all(OrderData.product.map(({productId,quantity}) => {
            return Product.findOneAndUpdate({_id:productId},{$inc:{quantity:quantity}})
         }))

        // const OrderData = await Order.findById(orderId).lean()
        if(OrderData.paymentMethod=="Online"||OrderData.paymentMethod=="Online"){
            await User.findOneAndUpdate(OrderData.user,{$inc:{wallet:OrderData.finalAmount}})
        await Order.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"cancelled"}}) 
        await User.findOneAndUpdate({_id:OrderData.user},{
            $push: {
                wallethistory: { tdate: new Date(), amount:OrderData.finalAmount, sign:"credit" }
              }
        })

           
            res.redirect('/myorders')
        }else{
        await Order.findOneAndUpdate({_id:orderId},{$set:{orderStatus:"cancelled"}}) 
        res.redirect('/myorders')
        }
    } catch (error) {
        console.log(error.message);
    }
}


const acceptReturn = async (req, res) => {
    try {
        const orderId = req.query.id
        const orderData =  await Order.findOne({_id:orderId}).populate("product.productId").lean()
        const userid = orderData.user.toString()
        await User.findOneAndUpdate({_id:userid}, { $inc: { wallet: orderData.finalAmount } })
        await User.findOneAndUpdate({ _id: userid}, {
            $push: {
                wallethistory: { tdate: new Date(),
                amount: orderData.finalAmount,
                sign: "credit" }
            }
        })

          
        Promise.all(orderData.product.map(({productId,quantity}) => {
            return Product.findOneAndUpdate({_id:productId},{$inc:{quantity:quantity}})
         }))

        const changeStat = await Order.findByIdAndUpdate({ _id: orderId }, {
            $set: { orderStatus: "returned" }
        })
        res.redirect('/admin/orders')
    } catch (error) {

    }
}


const changeToDelivered = async (req, res) => {
    try {
        const orderId = req.query.id        
        const changeStat = await Order.findByIdAndUpdate({ _id: orderId }, {
            $set: { orderStatus: "delivered" }
        })
        res.redirect('/admin/orders')
    } catch (error) {

    }
}

const changeToOrdered = async (req, res) => {
    try {
        const orderId = req.query.id
        const changeStat = await Order.findByIdAndUpdate({ _id: orderId }, {
            $set: { orderStatus: "ordered" }
        })
        res.redirect('/admin/orders')
    } catch (error) {

    }
}

const changeToCancelled = async (req, res) => {
    try {
        const orderId = req.query.id
        const orderData =  await Order.findOne({_id:orderId}).populate("product.productId").lean()
        Promise.all(orderData.product.map(({productId,quantity}) => {
            return Product.findOneAndUpdate({_id:productId},{$inc:{quantity:quantity}})
         }))

       
        const changeStat = await Order.findByIdAndUpdate({ _id: orderId }, {
            $set: { orderStatus: "cancelled" }
        })
        res.redirect('/admin/orders')
    } catch (error) {

    }
}



const changedToShipped = async (req, res) => {
    try {
        const orderId = req.query.id
        const changeStat = await Order.findByIdAndUpdate({ _id: orderId }, {
            $set: { orderStatus: "shipped" }
        })
        res.redirect('/admin/orders')

    } catch (error) {

    }
}




module.exports = {
    placeOrder,
    success,
    userCancelOrder,
    acceptReturn,
    changeToDelivered,
    changeToOrdered,
    changeToCancelled,
    changedToShipped,
}