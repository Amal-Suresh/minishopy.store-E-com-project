const User = require('../models/userModel')
const Product = require('../models/productModel')
const Wishlist =require('../models/wishlistModel')
const Cart = require('../models/cartModel')

const wishList = async (req,res)=>{
    try {
            const productId = req.query.id;
            const userDataSession = req.session.userDatas;
            const userId = userDataSession._id;
            const userData = await User.findById(userDataSession._id);
            const productData = await Product.findById(productId);
            const userWishList = await Wishlist.findOne({user:userId})

            if (userWishList) {
                const productExistIndex = userWishList.product.findIndex(
                    (item) => item.productId == productId
                  );
                if (productExistIndex >= 0) {
                    await Wishlist.findOneAndUpdate(
                      { user: userId },
                      { $pull: { product: { productId: productId } } }
                    ).then(() => {
                      res.json({ message: true });
                    });
                  } else {
                    await Wishlist.findOneAndUpdate(
                      { user: userId },
                      {
                        $push: {
                          product: { productId: productId, price: productData.price }
                        }
                      }
                    );
                    res.redirect('/shop');
                  }   
            } else {

                const data = await new Wishlist({
                    user: userId,
                    product: [
                        {
                            productId: productId,
                            price: productData.price,
                        },
                    ],
                });

                await data.save();
                res.redirect('/shop');
            }
    } catch (error) {
        console.log(error.message);
        
    }
}

const loadWishList = async (req,res) =>{
    try {
        if(req.session.userDatas){
            const username =req.session.userDatas.fname
            const findWishList = await Wishlist.findOne({user:req.session.userId}).populate('product.productId').lean();
            const cartdata = await cart.find({ user: req.session?.userDatas?._id });
            const productArray = cartdata.map(cart => cart.product); 
            const cartCount = productArray.reduce((count, product) => count + product.length, 0); 
            res.render('wishlist',{findWishList,user:true,username,cartCount})
        }else{
          res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        
    }

}

const deteteWishListProduct = async(req,res)=>{
  try {
    if(req.session.userDatas){
    const productId = req.query.id;
    const userId = req.session.userDatas._id
    const username = req.session.userDatas.fname
    const deletepro = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { product: { productId: productId } } }
    )
    const findWishList = await Wishlist.findOne({user:req.session.userId}).populate('product.productId').lean();   
    res.render('wishlist',{findWishList,user:true,username})

    }
    
  } catch (error) {
    console.log(error.message);
  }
}

module.exports={
    wishList,
    loadWishList,
    deteteWishListProduct
}