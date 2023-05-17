const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt')
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const { request } = require('../routes/userRouter');
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const cloudinary = require('../middleware/cloudnery')

const multer = require('multer')
const path = require("path");
const { log } = require('console');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/productImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
})

const upload = multer({ storage: storage })

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
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

const loadHome = async (req, res) => {
    try {

        const countCod = { paymentMethod: "COD" };
        const cCod = await Order.countDocuments(countCod)
        const countOnline = { paymentMethod: "Online" };
        const cOnline = await Order.countDocuments(countOnline)
        const countWallet = { paymentMethod: "Wallet" };
        const cWallet = await Order.countDocuments(countWallet)


        const countDelivered = { orderStatus: "delivered" };
        const cDelivered = await Order.countDocuments(countDelivered)

        const countOrdered = { orderStatus: "ordered" };
        const cOrdered = await Order.countDocuments(countOrdered)

        const countReturned = { orderStatus: "returned" };
        const cReturned = await Order.countDocuments(countReturned)

        const countShipped = { orderStatus: "shipped" };
        const cShipped = await Order.countDocuments(countShipped)

        const countCancelled = { orderStatus: "cancelled" };
        const cCancel = await Order.countDocuments(countCancelled)

        // const clogs = await Order.find({orderStatus:"delivered"},'product').lean()
        // const clogsProducts =clogs.flatMap(order=> order.product).flat()
        // const clogsProductIds = clogsProducts.map(product=>product._id)

        // console.log(clogsProductIds,"???????????????????????????????????????????");
       
        // const clogsCat = await Category.findOne({name:"clogs"}).lean()
        
        // const clogsCatId = clogsCat._id
        
        // const productsInClogsCat = await Product.find({category:clogsCatId,_id:{$in:clogsProductIds}}).lean()
        
        // const clogsCount =productsInClogsCat.length

        // console.log(clogsCount,"./.././/.//././/..////.../././//.///./././...",productsInClogsCat,clogsCat);
















        res.render('home', { admin: true, dash: true, cWallet, cOnline, cCod ,cOrdered,cReturned,cDelivered,cShipped,cCancel})
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

const insertAdmin = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)
        const admin = new Admin({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: spassword,
        })
        const adminData = await admin.save();
        if (adminData) {
            res.render("login", { message: "registration successfull", login: true })
        } else {
            res.render("register", { message: "registration failed", login: true })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const adminData = await Admin.findOne({ email: email })
        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password)
            if (passwordMatch) {
                req.session.adminId = adminData._id;
                req.session.adminName = adminData.fname;

                const countCod = { paymentMethod: "COD" };
                const cCod = await Order.countDocuments(countCod)
                const countOnline = { paymentMethod: "Online" };
                const cOnline = await Order.countDocuments(countOnline)
                const countWallet = { paymentMethod: "Wallet" };
                const cWallet = await Order.countDocuments(countWallet)


                const countDelivered = { orderStatus: "delivered" };
                const cDelivered = await Order.countDocuments(countDelivered)

                const countOrdered = { orderStatus: "ordered" };
                const cOrdered = await Order.countDocuments(countOrdered)

                const countReturned = { orderStatus: "returned" };
                const cReturned = await Order.countDocuments(countReturned)

                const countShipped = { orderStatus: "shipped" };
                const cShipped = await Order.countDocuments(countShipped)

                const countCancelled = { orderStatus: "cancelled" };
                const cCancel = await Order.countDocuments(countCancelled)






                res.render('home', { admin: true, dash: true, cWallet, cOnline, cCod, cDelivered, cOrdered, cReturned, cShipped, cCancel })
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

const listUsers = async (req, res) => {
    try {
        const usersData = await User.find().lean()
        console.log(usersData);
        res.render('userlist', { admin: true, users: usersData, userlist: true })

    } catch (error) {
        console.log(error.message);

    }

}
const blockUser = async (req, res) => {
    try {
        const userData = await User.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: false } })
        req.session.userId = null
        req.session.userDatas = null
        req.session.fname = null
        res.redirect('/admin/userslist')

    } catch (error) {
        console.log(error.message);

    }
}

const unblockUser = async (req, res) => {
    try {
        const userData = await User.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: true } })
        res.redirect('/admin/userslist')

    } catch (error) {
        console.log(error.message);

    }
}



const loadCategory = async (req, res) => {
    try {
        const categoryData = await Category.find().lean()
        res.render('category', { admin: true, category: categoryData })
    } catch (error) {
        console.log(error.message);

    }
}

const insertCategory = async (req, res) => {
    try {

        const existingCategory = await Category.findOne({ name: req.body.name });
        console.log(existingCategory);
        if (existingCategory) {
            const category = await Category.find().lean();

            res.render('category', { category, cae: "category already exists", admin: true, });


        } else {
            const categorys = new Category({
                name: req.body.name
            });
            await categorys.save();
            const category = await Category.find().lean();
            res.render('category', { category, cne: "category was added", admin: true });
        }


    } catch (error) {
        console.log(error.message);
    }
};

const listCategory = async (req, res) => {
    try {
        console.log(req.body._id);
        const categoryData = await Category.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: false } })
        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message);

    }
}

const unlistCategory = async (req, res) => {
    try {
        console.log(req.body);

        const categoryData = await Category.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: true } })
        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message);

    }
}

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id
        await Category.deleteOne({ _id: id })
        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.message);


    }
}

const loadProducts = async (req, res) => {
    try {
        const productData = await Product.find().populate('category').lean()
        res.render('products', { admin: true, products: productData })

    } catch (error) {
        console.log(error.message);

    }
}

const loadAddProduct = async (req, res) => {
    try {
        const categoryData = await Category.find().lean()
        res.render('addproduct', { login: true, category: categoryData })

    } catch (error) {
        console.log(error.message);
    }
}



const addProducts = async (req, res) => {
    try {

        let img = []
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path)
            img.push(result.public_id)     
        }
        const product = new Product({
            name: req.body.name,
            bname: req.body.brand,
            image: img,
            price: req.body.price,
            quantity: req.body.quantity,
            category: req.body.category

        })

        const productData = await product.save();
        console.log(productData, "drdtfflgukdfddsskrsrdddrjdk");
        if (productData) {

            res.redirect("/admin/products")
        } else {
            res.redirect("/admin/products")

        }
    } catch (error) {
        console.log(error.message);
    }
}

const listProduct = async (req, res) => {
    try {
        await Product.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: false } })
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);

    }
}

const unlistProduct = async (req, res) => {
    try {
        await Product.findByIdAndUpdate({ _id: req.params.id }, { $set: { status: true } })
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);

    }
}
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id
        await Product.deleteOne({ _id: id })
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);


    }
}

const loadUpdateProduct = async (req, res) => {
    try {
        const categoryData = await Category.find().lean()
        const id = req.query.id
        const productData = await Product.findOne({ _id: id }).populate('category').lean()
        res.render('updateproduct', { login: true, categoryData, productData })
        console.log(productData, categoryData);
        console.log("load updagte product--------------------------------")
    } catch (error) {
        console.log(error.message);
    }
}

const updateProduct = async (req, res) => {
    try {
        // const img = req.files.map((file) => file.filename)
        const cateName = await Category.findOne({ name: req.body.category }).lean()

        if (req.files) {
            const existingProduct = await Product.findById(req.query.id)
            let images = existingProduct.image
            req.files.forEach((file) => {
                images.push(file.filename)
            });


            var img = images
        }
        await Product.updateOne({ _id: req.query.id }, {
            $set: {
                name: req.body.name,
                bname: req.body.brand,
                price: req.body.price,
                image: img,
                quantity: req.body.quantity,
                category: cateName._id
            }
        })

        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}

const removeProductImg = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.updateOne({ _id: id }, { $pull: { image: req.query.imageId } })
        res.redirect(`/admin/updateproduct?id=${id}`)
    } catch (error) {

    }
}

const loadOrderList = async (req, res) => {
    try {
        const Orders = await Order.find().lean()

        const allOrders = Orders.map((order) => {
            const orderDate = new Date(order.date)
            const date = orderDate.toLocaleString()
            const _id = order._id
            const finalAmount = order.finalAmount
            const orderStatus = order.orderStatus
            const paymentMethod = order.paymentMethod
            return { date, _id, orderStatus, finalAmount, paymentMethod }
        })

        res.render('orders', { admin: true, allOrders })
    } catch (error) {
        console.log(error.message);
    }
}


const viewOrder = async (req, res) => {
    try {
        const orderId = req.query.id
        const orderDetails = await Order.findOne({ _id: orderId }).populate('product.productId').lean()

        const date = new Date(orderDetails.date)
        const orderDate = date.toLocaleString()

        const userId = orderDetails.user
        const userDetails = await User.findOne({ _id: userId }).lean()

        res.render('viewOrder', { login: true, orderDetails, userDetails, orderDate })
    } catch (error) {
        console.log(error.message);
    }
}

const adminLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);

    }

}

const salesReport = async (req, res) => {
    try {

        console.log("sales reached");
        const from = req.query.from
        const to = req.query.to

        let query = { orderStatus: "delivered" }
        if (from && to) {
            query.date = {
                $gte: from,
                $lte: to
            };
        } else if (from) {
            query.date = {
                $gte: from
            };
        } else if (to) {
            query.date = {
                $lte: to
            };
        }

        const deliveredPro = await Order.find(query).populate('user').lean()
        
        const adminname = req.session.adminName

        const deliveredProducts = deliveredPro.map((order) => {
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleString();
            const orderId = order._id;
            const finalAmount = order.finalAmount;
            const paymentMethod = order.paymentMethod;
            const firstName = order.user ? order.user.fname : '';
          
            return { date: formattedDate, _id: orderId, finalAmount, paymentMethod, fname: firstName };
          });
          
        res.render('sales', { admin: true, adminname,deliveredProducts, to, from })
    } catch (error) {

    }
}








module.exports = {
    loadLogin,
    loadHome,
    insertAdmin,
    verifyLogin,
    loadRegister,
    listUsers,
    blockUser,
    unblockUser,
    loadCategory,
    insertCategory,
    listCategory,
    unlistCategory,
    deleteCategory,
    loadProducts,
    loadAddProduct,
    addProducts,
    listProduct,
    unlistProduct,
    deleteProduct,
    loadUpdateProduct,
    updateProduct,
    removeProductImg,
    loadOrderList,
    viewOrder,
    adminLogout,
    salesReport,





}
