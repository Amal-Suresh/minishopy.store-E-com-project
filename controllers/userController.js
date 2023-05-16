const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { otpGen } = require('../controllers/otpGenerator')
const randomstring = require('randomstring')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Order = require('../models/orderModel')
const Banner =require('../models/bannerModel')
require("dotenv").config()

const sMail = ((email, otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
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
            user: config.emailUser,
            pass: config.emailPassword
        }
    });

    const mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'For reset password',
        // text: `Your OTP is ${otp}`
        html: '<p>Hii' + fname + ',Please click here to <a href="http://127.0.0.1:3000/forget-password?token=' + token + '">Reset</a> your password.</p>'
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



const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


const loadRegister = async (req, res) => {
    try {
        res.render('register', { login: true })
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async (req, res) => {
    try {
        res.render('login', { login: true })
    } catch (error) {
        console.log(error.message);
    }
}

const home = async (req, res) => {
    try {
        const bannerData = await Banner.find({status:true}).lean();
        
        const category = await Category.find().lean()
        const products = await Product.find().lean()
        if(req.session.userDatas){
            username = req.session.userDatas.fname
            res.render('home', { user: true, products, category ,bannerData,username })
        }else{
            res.render('home', { user: true, products, category ,bannerData })

        }
       

    } catch (error) {
        console.log(error.message);

    }

}

// const loadHome = async (req, res) => {
//     try {
//         const bannerData = await Banner.find({status:true}).lean();
       
//         const category = await Category.find().lean()
//         const products = await Product.find().lean()
//         username = req.session.userDatas.fname
//         res.render('home', { user: true, products, category, username,bannerData })
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const loadAbout = async (req, res) => {
    try {
        username = req.session.userDatas.fname
        res.render('about', { user: true, username })
    } catch (error) {
        console.log(error.message);
    }
}


const loadContact = async (req, res) => {
    try {
        username = req.session.userDatas.fname
        res.render('contact', { user: true, username })
    } catch (error) {
        console.log(error.message);
    }
}

const loadOtp = async (req, res) => {
    try {
        res.render('otp', { otp: true, email: userdata.email })
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);
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
                    const bannerData = await Banner.find({status:true}).lean();

                    res.render('home', { user: true, products, category, username: req.session.fname,bannerData })

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
        console.log(error.message);

    }
}


const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message);

    }

}
const loadForgotPass = async (req, res) => {
    try {
        res.render('forgetpass', { login: true })
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);

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
        console.log(error.message);

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
        console.log(error.message);

    }
}

const loadSingleProduct = async (req, res) => {

    try {
        username = req.session.userDatas.fname
        const singleProduct = await Product.findById({ _id: req.query.id }).lean()
        let { name, bname, image, quantity, price, _id } = singleProduct
        console.log(_id);
        res.render('product-single', { user: true, pro: true, name, bname, image, quantity, price, _id, username })

    } catch (error) {
        console.log(error.message);
    }
}

const userProfile = async (req, res) => {
    try {
        const userDatas = await User.findById({ _id: req.session.userDatas._id }).lean()
        username = req.session.userDatas.fname
        const walletData =userDatas.wallethistory
        const walletHistory = walletData.map((data)=>{
            const date = new Date(data.tdate)
            const tdate = date.toLocaleString()
            const amount = data.amount
            const sign = data.sign
            const _id = data._id
            return{tdate,amount,sign,_id}
          })


        res.render('profile', { user: true, username, userDatas, walletHistory })
    } catch (error) {
        console.log(error.message);

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
        req.session.coupon = null
        req.session.couponId = null
        req.session.discount = null

        const username = req.session.userDatas.fname
        const userId = req.session.userDatas._id
        let totalAmount = req.session.totalAmount
        const userDetails = await User.findOne({ _id: userId }).populate('address').lean()
        const address = userDetails.address

        console.log(address);
        console.log(totalAmount);
        if (userDetails.address.length == 0) {
            let adressnull
            res.render('checkout', { user: true, username, totalAmount , adressnull:true})
        } else {
            res.render('checkout', { user: true, username, address, totalAmount })
        }

    } catch (error) {
        console.log(error.message);
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


        res.render('orderSuccess', { user: true, username, orderDatas ,orderDate})
    } catch (error) {
        console.log(error.message);
    }

}


const loadMyOrders = async (req, res) => {
    try {
        username = req.session.userDatas.fname
        const userId = req.session.userDatas._id
        const uOrder = await Order.find({ user: userId }).populate('product.productId').lean()
        const userOrder = uOrder.map((order)=>{
            const orderDate = new Date(order.date)
            const date = orderDate.toLocaleString()
            const _id = order._id
            const finalAmount = order.finalAmount
            const orderStatus =order.orderStatus
            const paymentMethod = order.paymentMethod
            return{date,_id,orderStatus,finalAmount,paymentMethod}
          })

        res.render('myOrders', { user: true, userOrder, username })
    } catch (error) {

    }
}

const orderData = async (req, res) => {
    try {
        username = req.session.userDatas.fname
        const orderId = req.params.id
        const orderDetails = await Order.findOne({ _id: orderId }).populate('product.productId').lean()
        const date = new Date(orderDetails.date)
        const orderDate = date.toLocaleString()

        res.render('singleOrder', { orderDetails, login: true, username,orderDate })
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
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
        console.log(error.message);
    }
}

const returnRequest = async (req,res)=>{
    try {
        const orderId = req.query.id 
        const changeStat = await Order.findByIdAndUpdate({_id:orderId},{
            $set:{orderStatus:"requested for return"}
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
        console.log(error.message);
    }
}



const userShop = async (req, res) => {
    try {

      const username =req.session.userDatas.fname
      const category = await Category.find({status:true}).lean()
    var page=1;
    if(req.query.page){
      page=req.query.page
    }
    const limit=8;  
  var search = req.query.search || ''; // Get the search value from req.query or set to empty string if not present
            console.log(search,"search text");
  var categoryId = req.query.categoryId; // Get the categoryId value from req.query
            console.log(categoryId,"category id");
  var sortValue= req.query.sort||""
            console.log(sortValue,"sort value"); 
      var sortValue=1;
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
     totalPages=Math.ceil(count/limit) 
    currentPage=page
    nextPage=currentPage+1
    previousPage=currentPage-1 
      res.render("shop", { user: true,totalPages,currentPage,nextPage,previousPage,categoryId,sortValue,username,products,category});
    } catch (err) {
      console.log(err.message);
    }
  };




module.exports = {
    loadRegister,
    loadLogin,
    // loadHome,
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
    userShop

}