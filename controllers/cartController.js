const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const User = require('../models/userModel')

const cart = async (req, res) => {
    try {
        const productId = req.body.proId;
        const username = req.session.userDatas?.fname || 'Guest';
        const userDataSession = req.session.userDatas;
        const userId = userDataSession._id;
        const userData = await User.findById(userDataSession._id);
        const productData = await Product.findById(productId);
        const userCart = await Cart.findOne({ user: userId });

        // Check if the product is in stock
        if (productData.quantity != 0) {
            if (userCart) {
                // Check if the product already exists in the cart
                const productExistIndex = userCart.product.findIndex(
                    (product) => product.productId == productId
                );

                if (productExistIndex >= 0) {
                    // Product already in the cart
                    return res.json({ qty: true });
                } else {
                    // Add the new product to the cart
                    await Cart.findOneAndUpdate(
                        { user: userId },
                        {
                            $push: {
                                product: { 
                                    productId: productId, 
                                    price: productData.price, 
                                    totalPrice: productData.price 
                                },
                            },
                        }
                    );
                    return res.json({ message: true });
                }
            } else {
                // Create a new cart for the user
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
                return res.json({ message: true });
            }
        } else {
            // Product out of stock
            return res.json({ stock: "out of stock" });
        }
    } catch (error) {
        return res.status(500).send(error.message); // Ensure a single error response is sent
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
        const cartdata = await Cart.find({ user: req.session?.userDatas?._id });
        const productArray = cartdata.map(cart => cart.product); 
        const cartCount = productArray.reduce((count, product) => count + product.length, 0); 
        res.render('cart', { user: true, findCart, subPrice, grandTotal, username,cartCount });
    } catch (error) {
        console.log(error.message);
    }
}

const deteteCartProduct = async (req, res) => {
    try {

        const productId = req.body.id;
        const userId = req.session.userDatas._id
        const username = req.session.userDatas.fname
        const deletepro = await Cart.findOneAndUpdate(
            { user: userId },
            { $pull: { product: { productId: productId } } }
        ).then((value) => {
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