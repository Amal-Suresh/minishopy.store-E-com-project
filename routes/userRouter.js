const express = require('express')
const userRouter = express()

const userController = require("../controllers/userController")
const session = require('express-session')
const cartContoller = require('../controllers/cartController')
const wishListController = require('../controllers/wishlistController')
const orderController = require('../controllers/orderController')
const couponContoller = require("../controllers/couponController")
userRouter.use(session({ secret:process.env.SECRET_KEY, resave: true, saveUninitialized: true }))

const auth = require("../middleware/auth")

userRouter.set('view engine', 'hbs')
userRouter.set('views', './views/user')

const bodyParser = require('body-parser')
userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({ extended: true }))

userRouter.get('/login',auth.islogOut,userController.loadLogin)
userRouter.get('/register', auth.islogOut, userController.loadRegister)
// render home
userRouter.get('/',userController.home)

userRouter.get('/about',auth.isLogin,userController.loadAbout)
// render checkout
userRouter.get('/checkout',auth.isLogin,userController.loadCheckout)
// render contact
userRouter.get('/contact',auth.isLogin,userController.loadContact)

userRouter.post('/register', userController.signupSubmit)
userRouter.get('/otp', userController.loadOtp)

userRouter.post('/checkotp', userController.verifyOtp)
userRouter.post('/login', userController.verifyLogin)
userRouter.get('/logout', userController.userLogout)
userRouter.get('/forgetpass', userController.loadForgotPass)
userRouter.post('/forgetpass', userController.verifyForget)

//add middleware to check user is Logout
userRouter.get('/forget-password', userController.forgetPasswordLoad)
userRouter.post('/forget-password', userController.resetPassword)
userRouter.get('/resendotp', userController.reSendOpt)
//single product
userRouter.get('/singleproduct',auth.isLogin, userController.loadSingleProduct)
//cart
userRouter.get('/cart',auth.isLogin,cartContoller.cartPage)
userRouter.post('/addtocart',auth.isLogin,cartContoller.cart)

//wishlist
userRouter.get('/addtowishlist',auth.isLogin,wishListController.wishList)

userRouter.get('/wishlist',auth.isLogin,wishListController.loadWishList)

userRouter.get('/userprofile',auth.isLogin,userController.userProfile)

userRouter.get('/deleteproduct',auth.isLogin,wishListController.deteteWishListProduct)


userRouter.patch('/deleteCartproduct',auth.isLogin,cartContoller.deteteCartProduct)


userRouter.patch("/increment",auth.isLogin,cartContoller.increment);

// <<<<<<<<<<<<<<<<<<<<<<<<< cart item decrement   >>>>>>>>>>>>>>>>>>>>>>

userRouter.patch("/decrement",auth.isLogin,cartContoller.decrement);

userRouter.post('/updatedetails',auth.ifUserLogged,userController.updateUserProfile)
userRouter.get('/addressSelection',auth.isLogin,userController.loadNewAddress)
userRouter.post('/addaddress',userController.addAddress)

userRouter.post('/placeorder',orderController.placeOrder)

userRouter.post('/success',orderController.success)

userRouter.get('/ordersuccess',auth.isLogin,userController.loadOrderPlaced)

userRouter.get('/myorders',auth.isLogin,userController.loadMyOrders)

userRouter.get('/orderDetails/:id',auth.isLogin,userController.orderData)

userRouter.get('/userCoupons',auth.isLogin,couponContoller.userCouponRender)

userRouter.post('/applycoupon',couponContoller.applycoupon)
userRouter.get('/selectaddress',auth.isLogin,userController.selectUserAddress)
userRouter.get('/deleteaddress',auth.isLogin,userController.deleteAddress)
userRouter.post('/updateaddress',userController.updateAddress)
userRouter.get('/editaddress',userController.loadEditAddress)

userRouter.get('/returnorder',auth.isLogin,userController.returnRequest)
userRouter.get('/removecoupon',auth.isLogin,couponContoller.removeCoupon)

userRouter.get("/shop",userController.userShop)
userRouter.get('/cancelorder',auth.isLogin,orderController.userCancelOrder)
userRouter.post('/addmoney',auth.isLogin,userController.addMoney)
userRouter.post('/addmoneysuccess',auth.isLogin,userController.addingMoneytoWallet)






module.exports = userRouter
