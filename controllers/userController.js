const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { otpGen } = require('../controllers/otpGenerator')
const randomstring = require('randomstring')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const Banner = require('../models/bannerModel')
const cart = require('../models/cartModel')
require("dotenv").config()
const Razorpay = require("razorpay")

var instance = new Razorpay({ key_id: process.env.RAZOR_KEYID, key_secret: process.env.RAZOR_SECRET })



const sMail = ((email, otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP',
        text: `Your OTP is ${otp}`
    };

    // send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
})

// sent mail for reset password
const sendResetPasswordMail = ((fname, email, token) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'For reset password',
        // text: `Your OTP is ${otp}`
        html: '<p>Hii' + fname + ',Please click here to <a href="https://minishopy.store/forget-password?token=' + token + '">Reset</a> your password.</p>'
    };

    // send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        //else { 
        //     // console.log('Email sent: ' + info.response);

        // }
    })
})

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {

    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('register', { login: true })
    } catch (error) {

    }
}

const loadLogin = async (req, res) => {
    try {
        res.render('login', { login: true })
    } catch (error) {

    }
}

const home = async (req, res) => {
    try {
        const bannerData = await Banner.find({ status: true }).lean();

        const category = await Category.find().lean()
        const products = await Product.find().lean()
        const cartdata = await cart.find({ user: req.session?.userDatas?._id });
        const productArray = cartdata.map(cart => cart.product);
        const cartCount = productArray.reduce((count, product) => count + product.length, 0);

        if (req.session.userDatas) {
            username = req.session.userDatas.fname
            res.render('home', { user: true, products, category, bannerData, username, cartCount })
        } else {
            res.render('home', { user: true, products, category, bannerData, cartCount })

        }

    } catch (error) {


    }

}

const loadAbout = async (req, res) => {
    try {
        username = req.session.userDatas?.fname
        const cartdata = await cart.find({ user: req.session?.userDatas?._id });
        const productArray = cartdata.map(cart => cart.product);
        const cartCount = productArray.reduce((count, product) => count + product.length, 0);
        res.render('about', { user: true, username, cartCount })
    } catch (error) {
        res.render('404', { login: true })
    }
}


const loadContact = async (req, res) => {
    try {
        const cartdata = await cart.find({ user: req.session?.userDatas?._id });
        const productArray = cartdata.map(cart => cart.product);
        const cartCount = productArray.reduce((count, product) => count + product.length, 0);
        username = req.session.userDatas?.fname
        res.render('contact', { user: true, username, cartCount })
    } catch (error) {
        res.render('404', { login: true })
    }
}

const loadOtp = async (req, res) => {
    try {
        res.render('otp', { otp: true, email: userdata.email })
    } catch (error) {
        res.render('404', { login: true })
    }
}

let oneTimePin;
let userdata;

const signupSubmit = (req, res) => {
    oneTimePin = otpGen()
    userdata = req.body
    sMail(req.body.email, oneTimePin)
    res.redirect('/otp')
}

const reSendOpt = (req, res) => {
    oneTimePin = otpGen()
    sMail(userdata.email, oneTimePin)
    res.redirect('/otp')
}



const verifyOtp = async (req, res) => {
    try {
        let { val1, val2, val3, val4, val5, val6 } = req.body
        let formOtp = Number(val1 + val2 + val3 + val4 + val5 + val6)
        console.log(formOtp);
        console.log(oneTimePin);
        if (formOtp == oneTimePin) {

            console.log(userdata);
            let { fname, lname, password, mobile, email } = userdata
            const spassword = await securePassword(password)
            console.log(spassword);
            const user = new User({
                fname: fname,
                lname: lname,
                email: email,
                mobile: mobile,
                password: spassword
            })
            const userData = await user.save();
            res.render("login", { sucessmessage: "registration successfull", login: true })

        } else {
            res.render("register", { errormessage: "registration failed", login: true })
        }
    } catch (error) {

    }

}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email })

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.status == 1) {
                    req.session.userId = userData._id;
                    req.session.userDatas = userData
                    req.session.fname = userData.fname
                    const category = await Category.find().lean()
                    const products = await Product.find().lean()
                    const bannerData = await Banner.find({ status: true }).lean();

                    res.render('home', { user: true, products, category, username: req.session.fname, bannerData })

                } else {
                    res.render('login', { message: "you were blocked by admin", login: true })

                }
            } else {
                res.render('login', { message: "incorrect email or password", login: true })
            }

        } else {
            res.render('login', { message: "incorrect email or password", login: true })
        }
    } catch (error) {


    }
}

const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {


    }

}
const loadForgotPass = async (req, res) => {
    try {
        res.render('forgetpass', { login: true })
    } catch (error) {
        res.render('404', { login: true })
    }
}

const verifyForget = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email })
        if (userData) {
            console.log(userData.fname);
            const randomString = randomstring.generate()
            const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } })
            sendResetPasswordMail(userData.fname, userData.email, randomString)
            res.render('forgetpass', { message: "Please Check your mail to reset your password", login: true })
        } else {
            res.render('forgetpass', { message: "Incorrect email", login: true })
        }

    } catch (error) {


    }
}

const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token
        const tokenData = await User.findOne({ token: token })
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id, login: true })

        } else {
            res.render('404', { message: "token is invalid" })


        }
    } catch (error) {


    }
}
const resetPassword = async (req, res) => {
    try {
        const password = req.body.password
        const user_id = req.body.user_id
        const securePassWord = await securePassword(password)
        await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: securePassWord, token: '' } })
        res.render('login', { message: "password changed successfully", login: true })
    } catch (error) {


    }
}

const loadSingleProduct = async (req, res) => {

    try {
        const cartdata = await cart.find({ user: req.session?.userDatas?._id });
        const productArray = cartdata.map(cart => cart.product);
        const cartCount = productArray.reduce((count, product) => count + product.length, 0);

        username = req.session.userDatas.fname
        const singleProduct = await Product.findById({ _id: req.query.id }).lean()
        let { name, bname, image, quantity, price, _id } = singleProduct
        console.log(_id);
        res.render('product-single', { user: true, pro: true, name, bname, image, quantity, price, _id, username, cartCount })

    } catch (error) {

    }
}

const userProfile = async (req, res) => {
    try {
        const cartdata = await cart.find({ user: req.session?.userDatas?._id });
        const productArray = cartdata.map(cart => cart.product);
        const cartCount = productArray.reduce((count, product) => count + product.length, 0);
        const userDatas = await User.findById({ _id: req.session.userDatas._id }).lean()
        username = req.session.userDatas.fname
        const walletData = userDatas.wallethistory
        const walletHistory = walletData.map((data) => {
            const date = new Date(data.tdate)
            const tdate = date.toLocaleString()
            const amount = data.amount
            const sign = data.sign
            const _id = data._id
            return { tdate, amount, sign, _id }
        })


        res.render('profile', { user: true, username, userDatas, walletHistory, cartCount })
    } catch (error) {


    }
}



const updateUserProfile = async (req, res) => {
    const updateUser = await User.findOneAndUpdate({ _id: req.body.id }, {
        $set: {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            mobile: req.body.mobile
        }
    })
    const userDatas = await User.findById({ _id: req.session.userDatas._id }).lean()
    req.session.userDatas = userDatas
    username = req.session.userDatas.fname

    res.render('profile', { user: true, userDatas, username })
}


const loadCheckout = async (req, res) => {
    try {
    console.log("reached");
        req.session.coupon = null
        req.session.couponId = null
        req.session.discount = null

        const cartdata = await cart.find({ user: req.session?.userDatas?._id }).populate('product').lean()

        const products = cartdata[0].product;
        const productIds = products.map(product => product.productId);
        Product.find({ _id: { $in: productIds } })
            .then(async foundProducts => {
                const hasProductWithZeroQuantity = foundProducts.some((foundProduct, index) => {
                    return foundProduct.quantity === 0 || foundProduct.quantity < products[index].quantity;
                });
                if (hasProductWithZeroQuantity) {

                    const findCart = await cart.findOne({ user: req.session.userId }).populate('product.productId').lean();
                    username = req.session.userDatas.fname
                    const subPrice = findCart.product.reduce((acc, curr) => acc += curr.totalPrice, 0);
                    const discount = 0
                    const deliveryCharge = 0
                    const grandTotal = subPrice + discount + deliveryCharge;
                    req.session.totalAmount = grandTotal
                    const cartdata = await cart.find({ user: req.session?.userDatas?._id });
                    const productArray = cartdata.map(cart => cart.product); 
                    const cartCount = productArray.reduce((count, product) => count + product.length, 0); 
                    const errorMessage = 'Some products have insufficient quantity.';

                    res.render('cart', { user: true, findCart, subPrice, grandTotal, username,cartCount,errorMessage });
                    console.log(errorMessage);
                } else {
                    console.log('All products have sufficient quantity.');
                    const productArray = cartdata.map(cart => cart.product);
                    const cartCount = productArray.reduce((count, product) => count + product.length, 0);
                    const username = req.session.userDatas.fname
                    const userId = req.session.userDatas._id
                    let totalAmount = req.session.totalAmount
                    const userDetails = await User.findOne({ _id: userId }).populate('address').lean()
                    const address = userDetails.address
                    if (userDetails.address.length == 0) {
                        let adressnull
                        res.render('checkout', { user: true, username, totalAmount, adressnull: true, cartCount })
                    } else {
                        res.render('checkout', { user: true, username, address, totalAmount, cartCount })
                    }

                }
            })




    } catch (error) {

    }
}




const addAddress = async (req, res) => {
    const userId = req.session.userDatas._id
    let { name, city, pin, mobile, address, state, country } = req.body
    const newAddress = {
        name,
        city,
        pin,
        mobile,
        address,
        state,
        country
    }
    const updateAddress = await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { address: newAddress } })
    if (updateAddress) {
        const updatedUser = await User.findById({ _id: userId }).populate('address').lean()
        res.send({ uer: updatedUser.address })
    }
}

const loadNewAddress = async (req, res) => {
    try {
        res.render('addressSel', { login: true })
    } catch (error) {
        console.log(error.message);
    }
}
const loadOrderPlaced = async (req, res) => {
    try {
        username = req.session.userDatas.fname
        const orderId = req.session.userOrder
        const orderDatas = await Order.findOne({ _id: orderId }).populate('product.productId').lean()
        const date = new Date(orderDatas.date)
        const orderDate = date.toLocaleString()
        res.render('orderSuccess', { user: true, username, orderDatas, orderDate })
    } catch (error) {

    }

}

const loadMyOrders = async (req, res) => {
    try {
        username = req.session.userDatas.fname
        const userId = req.session.userDatas._id
        const uOrder = await Order.find({ user: userId }).populate('product.productId').lean()
        const userOrder = uOrder.map((order) => {
            const orderDate = new Date(order.date)
            const date = orderDate.toLocaleString()
            const _id = order._id
            const finalAmount = order.finalAmount
            const orderStatus = order.orderStatus
            const paymentMethod = order.paymentMethod
            return { date, _id, orderStatus, finalAmount, paymentMethod }
        })
        res.render('myOrders', { user: true, userOrder, username })
    } catch (error) {
        res.render('404', { login: true })
    }
}

const orderData = async (req, res) => {
    try {
        username = req.session.userDatas.fname
        const orderId = req.params.id
        const orderDetails = await Order.findOne({ _id: orderId }).populate('product.productId').lean()
        const date = new Date(orderDetails.date)
        const orderDate = date.toLocaleString()
        const crrDate = new Date()
        const timeDiff = Math.abs(crrDate.getTime() - date.getTime());
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        res.render('singleOrder', { orderDetails, login: true, username, orderDate, daysDiff })
    } catch (error) {
        res.render('404', { login: true })
    }
}


const selectUserAddress = async (req, res) => {
    try {
        const userId = req.session.userDatas._id
        const addessId = req.query.id
        const updateAddressStatus = await User.updateOne(
            { _id: userId, "address._id": addessId },
            {
                $set: {
                    "address.$.status": true
                },
            }
        );
        const userInfo = await User.find({ _id: userId }).select("address").lean();
        userInfo.forEach(async (elem) => {
            elem.address.forEach(async (innerelem) => {
                if (addessId != innerelem._id) {
                    await User.updateOne(
                        { "address._id": innerelem._id },
                        {
                            $set: {
                                "address.$.status": false
                            }
                        }
                    )
                }
            })
        })

        res.redirect('/checkout')
    } catch (error) {

    }
}

const updateAddress = async (req, res) => {
    try {
        const userId = req.session.userDatas._id
        const addressId = req.body._id
        console.log(req.body);
        const updateResult = await User.updateOne(
            { _id: userId, 'address._id': addressId },
            {
                $set: {
                    'address.$.name': req.body.name,
                    'address.$.address': req.body.address,
                    'address.$.city': req.body.city,
                    'address.$.country': req.body.country,
                    'address.$.state': req.body.state,
                    'address.$.mobile': req.body.mobile,
                    'address.$.pin': req.body.pin,
                },
            }
        );
        res.redirect('/checkout')
    } catch (error) {

    }
}


const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.userDatas._id
        await User.findByIdAndUpdate(userId, {
            $pull: { address: { _id: req.query.id } }
        })
        res.redirect('/checkout')
    } catch (error) {

    }
}

const loadEditAddress = async (req, res) => {
    try {
        const addressId = req.query.id
        const userId = req.session.userDatas
        const { address: [addressEditData] } = await User.findOne(
            { _id: userId },
            { address: { $elemMatch: { _id: addressId } } }).lean()

        res.render("updateAddress", { login: true, addressEditData })
    } catch (error) {
        res.render('404', { login: true })
    }
}

const returnRequest = async (req, res) => {
    try {
        const orderId = req.query.id
        const changeStat = await Order.findByIdAndUpdate({ _id: orderId }, {
            $set: { orderStatus: "requested for return" }
        })
        res.redirect('/myorders')
    } catch (error) {

    }
}

const loadShop = async (req, res) => {
    try {
        const category = await Category.find().lean()
        const products = await Product.find().lean()

        username = req.session.userDatas.fname
        res.render('shop', { user: true, products, category, username })
    } catch (error) {
        res.render('404', { login: true })
    }
}

const userShop = async (req, res) => {
    try {

        const cartdata = await cart.find({ user: req.session?.userDatas?._id });
        const productArray = cartdata.map(cart => cart.product);
        const cartCount = productArray.reduce((count, product) => count + product.length, 0);
        const username = req.session.userDatas?.fname 
        const category = await Category.find({ status: true }).lean()

        var page = 1;
        if (req.query.page) {
            page = req.query.page
        }

        const limit = 8;
        var search = req.query.search || ''; // Get the search value from req.query or set to empty string if not present
        console.log(search, "search text");
        var categoryId = req.query.categoryId; // Get the categoryId value from req.query
        console.log(categoryId, "category id");
        var sortValue = req.query.sort || ""
        console.log(sortValue, "sort value");
        var sortValue = 1;
        if (req.query.sort) {
            sortValue = req.query.sort;
        }
        const query = {
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { description: { $regex: '.*' + search + '.*', $options: 'i' } }
            ],

        };
        if (categoryId) {
            query.category = categoryId;
        }
        const products = await Product.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ price: sortValue })
            .exec();
        const count = await Product.find(query).countDocuments()
        totalPages = Math.ceil(count / limit)
        currentPage = page
        nextPage = currentPage + 1
        previousPage = currentPage - 1
        res.render("shop", { user: true, totalPages, currentPage, nextPage, previousPage, categoryId, sortValue, username, products, search, category, cartCount });
    } catch (err) {
        console.log(err);
        
        res.render('404', { login: true })
    }
};

const addMoney = async (req, res) => {
    req.session.walletAmount = req.body.amount;
    const { v4: uuidv4 } = require('uuid')
    const receiptId = uuidv4()
    const option = {
        amount: req.body.amount * 100,
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
}

const addingMoneytoWallet = async (req, res) => {
    const paymentDetails = req.body
    const crypto = require('crypto');
    let hmac = crypto.createHmac('sha256', '8fEDc3nKHEBt1muQWjodKhoa')
    hmac.update(paymentDetails['order[razorpay_order_id]'] + '|' + paymentDetails['order[razorpay_payment_id]']);
    hmac = hmac.digest('hex')
    if (hmac == paymentDetails['order[razorpay_signature]']) {
        console.log("payment successss");
        const userId = req.session.userDatas._id
        await User.findOneAndUpdate(userId, { $inc: { wallet: req.session.walletAmount } })
        await User.findOneAndUpdate({ _id: userId }, {
            $push: {
                wallethistory: { tdate: new Date(), amount: req.session.walletAmount, sign: "credit" }
            }
        })
        req.session.walletAmount = null
        res.json({ addmoney: true })
    } else {
        res.json({ failed: true })
    }
}




module.exports = {
    loadRegister,
    loadLogin,
    home,
    loadAbout,
    loadCheckout,
    loadContact,
    loadShop,
    signupSubmit,
    loadOtp,
    verifyOtp,
    verifyLogin,
    userLogout,
    loadForgotPass,
    verifyForget,
    forgetPasswordLoad,
    resetPassword,
    reSendOpt,
    loadSingleProduct,
    userProfile,
    updateUserProfile,
    addAddress,
    loadNewAddress,
    loadOrderPlaced,
    loadMyOrders,
    orderData,
    selectUserAddress,
    deleteAddress,
    updateAddress,
    loadEditAddress,
    returnRequest,
    userShop,
    addMoney,
    addingMoneytoWallet
}