const express = require('express')
const adminRoute = express()


const multerController = require("../middleware/multer")
const adminController = require("../controllers/adminController")
const couponController = require("../controllers/couponController")
const bannerController = require('../controllers/bannerController')
const orderController = require("../controllers/orderController")
const excelController = require("../controllers/excelContoller")

const auth = require('../middleware/auth')

adminRoute.set('view engine', 'hbs')
adminRoute.set('views', './views/admin')
const excelJs = require('exceljs')

adminRoute.get('/',auth.isAdminlogout, adminController.loadLogin)
adminRoute.post('/login', adminController.verifyLogin)
adminRoute.get('/register', adminController.loadRegister)
adminRoute.get('/home',auth.isAdminlogin,adminController.loadHome)
adminRoute.post('/register', adminController.insertAdmin)
adminRoute.get('/userslist',auth.isAdminlogin, adminController.listUsers)

adminRoute.get('/blockuser/:id',auth.isAdminlogin, adminController.blockUser)
adminRoute.get('/unblockuser/:id',auth.isAdminlogin, adminController.unblockUser)
adminRoute.get('/category',auth.isAdminlogin, adminController.loadCategory)
adminRoute.post('/addcategory', adminController.insertCategory)

adminRoute.get('/unlistcategory/:id',auth.isAdminlogin, adminController.listCategory)
adminRoute.get('/listcategory/:id',auth.isAdminlogin, adminController.unlistCategory)
adminRoute.get('/deletecategory/:id',auth.isAdminlogin, adminController.deleteCategory)
adminRoute.get('/products',auth.isAdminlogin, adminController.loadProducts)
adminRoute.get('/addproduct',auth.isAdminlogin, adminController.loadAddProduct)
adminRoute.post('/addproduct', multerController.upload.array('image', 3), adminController.addProducts)

adminRoute.get('/listproduct/:id',auth.isAdminlogin, adminController.listProduct)
adminRoute.get('/unlistproduct/:id',auth.isAdminlogin, adminController.unlistProduct)
adminRoute.get('/deleteproduct/:id',auth.isAdminlogin, adminController.deleteProduct)
adminRoute.get('/updateproduct',auth.isAdminlogin, adminController.loadUpdateProduct)
adminRoute.post('/updateproduct', multerController.upload.array('image', 3),adminController.updateProduct)
adminRoute.get('/changeimage',auth.isAdminlogin,adminController.removeProductImg)

adminRoute.get('/orders',auth.isAdminlogin,adminController.loadOrderList)
adminRoute.get('/vieworder',auth.isAdminlogin,adminController.viewOrder)

adminRoute.get('/coupons',auth.isAdminlogin,couponController.loadCoupons)
adminRoute.get('/addcoupon',auth.isAdminlogin,couponController.loadAddCoupons)
adminRoute.post('/addcoupon',auth.isAdminlogin,couponController.addCoupons)
adminRoute.get('/deactivate',auth.isAdminlogin,couponController.deActivateCoupon )
adminRoute.get('/activate',auth.isAdminlogin,couponController.activateCoupon )
adminRoute.get('/deletecoupon',auth.isAdminlogin,couponController.deleteCoupon)

adminRoute.get('/changetodelivered',auth.isAdminlogin,orderController.changeToDelivered)
adminRoute.get('/changetoordered',auth.isAdminlogin,orderController.changeToOrdered)
adminRoute.get('/changecancelled',auth.isAdminlogin,orderController.changeToCancelled)
adminRoute.get('/acceptreturn',auth.isAdminlogin,orderController.acceptReturn)
adminRoute.get('/changetoshipped',auth.isAdminlogin,orderController.changedToShipped)


adminRoute.get('/logout',adminController.adminLogout)

adminRoute.get('/sales',auth.isAdminlogin,adminController.salesReport)
adminRoute.get('/downloadexcel',auth.isAdminlogin,excelController.downloadExcel)

adminRoute.get('/banner',auth.isAdminlogin,bannerController.loadBanner)

adminRoute.get('/addbanner',auth.isAdminlogin,bannerController.loadAddBanner)

adminRoute.get('/updatebanner',auth.isAdminlogin,bannerController.loadUpdateBanner)

adminRoute.post('/addbanner',auth.isAdminlogin, multerController.upload.single('image'), bannerController.addBanner)
adminRoute.get('/removeimage',auth.isAdminlogin,bannerController.deleteBannerImg)
adminRoute.post('/updatebanner',auth.isAdminlogin, multerController.upload.single('image'),bannerController.updateBanner)
adminRoute.get('/deletebanner',auth.isAdminlogin,bannerController.deleteBanner)


adminRoute.get('/listbanner',auth.isAdminlogin,bannerController.listBanner)
adminRoute.get('/unlistbanner',auth.isAdminlogin,bannerController.unlistBanner)


module.exports = adminRoute