const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const User = require('../models/userModel')

// cart controller add to cart
const cart = async (req, res) => {
    try {
        
        const productId = req.body.proId;
        const username = req.session.userDatas.fname
        const userDataSession = req.session.userDatas;
        const userId = userDataSession._id;
        const userData = await User.findById(userDataSession._id);
        const productData = await Product.findById(productId);
        const userCart = await Cart.findOne({ user: userId });

        if(productData.quantity!=0){

        //if user cart available
        if (userCart) {
            const productExistIndex = userCart.product.findIndex(
                (product) => product.productId == productId
            );


            if (productExistIndex >= 0) {
                //  await Cart.findOneAndUpdate(
                //      { user: userId, "product.productId": productId },
                //      { $inc: { "product.$.quantity": 1 } }

                //  ).then((value) => {
                //     res.json({ qty:true});
                // });

                // const findcart = await Cart.findOne({ user: userId, 'product.productId': productId })
                // const find = findcart.product.find((value) => {
                //     return value.productId == productId
                // })


                // await Cart.findOneAndUpdate(
                //     { user: userId, "product.productId": productId },
                //     { $set: { "product.$.totalPrice": find.quantity * find.price } }

                // ).then((value) => {
                //     console.log(value);
                // })
                res.json({ qty:true});

            } else {
                await Cart.findOneAndUpdate(
                    { user: userId },
                    {
                        $push: {
                            product: { productId: productId, price: productData.price, totalPrice: productData.price },
                        },
                    }
                );
                res.json({message:true})
                // res.redirect('/shop')
                

            }
        } else {
            const data = new Cart({
                user: userId,
                product: [
                    {
                        productId: productId,
                        price: productData.price,
                        totalPrice: productData.price,
                        image: productData.image
                    },
                ],
            });

            await data.save();


//res.json({})
            res.json({message:true})
            //  res.redirect('/shop')
            
        }
    }else{
        res.json({stock:"out of stock"})
    }

    } catch (error) {
        res.send(error.message);
    }
};

const cartPage = async (req, res) => {
    try {

        const findCart = await Cart.findOne({ user: req.session.userId }).populate('product.productId').lean();


        if (req.session.userDatas) {
            username = req.session.userDatas.fname


        }
        if(findCart==null){
            res.render('emptycart',{user:true,username})
        }

        const subPrice = findCart.product.reduce((acc, curr) => acc += curr.totalPrice, 0);
        const discount = 0
        const deliveryCharge = 0
        const grandTotal = subPrice + discount + deliveryCharge;
        req.session.totalAmount = grandTotal

        
        res.render('cart', { user: true, findCart, subPrice, grandTotal, username });

    } catch (error) {
        console.log(error.message);
    }
}

const deteteCartProduct = async (req, res) => {
    try {

        const productId = req.body.id;
        console.log(req.body, '---------body id-------');
        const userId = req.session.userDatas._id
        const username = req.session.userDatas.fname
        const deletepro = await Cart.findOneAndUpdate(
            { user: userId },
            { $pull: { product: { productId: productId } } }
        ).then((value) => {
            console.log(value, '---------result------');
        })
        const findCart = await Cart.findOne({ user: req.session.userId }).populate('product.productId').lean();
        res.json({ findCart, user: true, username })



    } catch (error) {
        console.log(error.message);
    }
}

// ==========================quantity increment============

const increment = async (req, res) => {
    try {

        const productId = req.body.id
        const quantity = req.body.check;
        grandTotal = req.session.totalAmount
        const userid = req.session.userDatas;
        const s = await Product.findOne({ _id: productId }).lean();
        const stock = s.quantity
        if (quantity < stock) {
            await Cart.updateOne({ user: userid, 'product.productId': productId }, { $inc: { 'product.$.quantity': 1 } }).then(async (value) => {
                const qu = await Cart.findOne({ user: userid })
                const que = await Cart.findOne({ user: userid }).populate("product.productId").lean();
                const value1 = qu.product.find((values) => {
                    return values.productId == productId
                })
                const price1 = s.price
                const price2 = value1.quantity
                // const price = price1 * price2
                const totalPrice = price1 * price2
                await Cart.updateOne({ user: userid, 'product.productId': productId }, { $inc: { "product.$.totalPrice": price1 } }).then(async (value) => {
                    const cartList = await Promise.all(que.product.map(({
                        productId, quantity, totalPrice }) => ({
                            Name: productId.productName,
                            price: productId.price,
                            image: productId.image,
                            totalPrice,
                            quantity,
                            productId
                        })))

                    subPrice = req.session.totalAmount
                    grandTotal = await Amount(cartList)
                   req.session.totalAmount = grandTotal 

                    return res.json({ value1, stock, success: true, subPrice, totalPrice, grandTotal })
                })
            })

        } else {

            const qu = await Cart.findOne({ user: userid })

            const value1 = qu.product.find((values) => {
                return values.productId == productId
            })
            return res.json({ value1, success: false })
        }
    } catch (error) {

        console.log(error);

    }
}


// =============================quatity decrement==================
const decrement = async (req, res, next) => {
    try {

        const productId = req.body.id
        const quantity = req.body.check;
        grandTotal = req.session.totalAmount
        const userid = req.session.userDatas;

        const qu = await Cart.findOne({ user: userid })

        const que = await Cart.findOne({ user: userid }).populate("product.productId").lean();

        const s = await Product.findOne({ _id: productId }).lean();
        const price1 = s.price


        const qfind = qu.product.find((value) => {
            return value.productId == productId
        })

        if (qfind.quantity == 1) {
            const value1 = qu.product.find((value) => {
                return value.productId == productId
            })
            console.log('---data--');
            console.log('---data--', value1.quantity);

            const price2 = value1.quantity
            const price = price1 * price2
            return res.json({ value1, message: ' Item removed ', grandTotal, price })

        }
        else {
            await Cart.updateOne({ user: userid, 'product.productId': productId }, { $inc: { 'product.$.quantity': -1 } }).then(async (value) => {
                const value1 = qu.product.find((values) => {
                    return values.productId == productId
                })

                const price2 = value1.quantity
                const uprice = price1 * price2
                await Cart.updateOne({ user: userid, 'product.productId': productId }, { $inc: { "product.$.totalPrice": -price1 } }).then(async (value) => {
                    const cartList = await Promise.all(que.product.map(({
                        productId, quantity, totalPrice }) => ({
                            name: productId.productName,
                            price: productId.price,
                            image: productId.image,
                            totalPrice,
                            quantity,
                            productId
                        })))

                    grandTotal = await Amount(cartList)
                    req.session.totalAmount =grandTotal

                    return res.json({ value1, message: ' Item removed ', grandTotal, uprice })
                })
            })
        }
    } catch (error) {
        console.log(error.message);
        res.render('error500')

    }
}

//  total amount CALCULATING

function Amount(cartList) {
    total = cartList.reduce((acc, curr) => {
        acc += (curr.price * curr.quantity);

        return acc;
    }, 0);
    return total;
}



module.exports = {
    cart,
    cartPage,
    deteteCartProduct,
    increment,
    decrement

}