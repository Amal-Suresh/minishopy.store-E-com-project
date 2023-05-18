const Coupon= require('../models/couponModel')
const User = require('../models/userModel')


const loadCoupons =async(req,res)=>{
    try {
        const coup = await Coupon.find().lean()
        const coupons = coup.map((coupon)=>{
          const date = new Date(coupon.expireDate)
          const mainDate = date.toLocaleString()
          const _id = coupon._id
          const couponName = coupon.couponName
          const couponCode =coupon.couponCode
          const discountValue = coupon.discountValue
          const limit = coupon.limit
          const status = coupon.status
          const maxDiscount =coupon.maxDiscount
          const minPurchase = coupon.minPurchase 
          return{expireDate:mainDate,_id,couponName,maxDiscount,limit,status,couponCode,discountValue,minPurchase}
        })
        res.render('coupons',{admin:true,coupons})
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddCoupons =async(req,res)=>{
    try {
      res.render('addCoupon',{login:true})  
    } catch (error) {
        
    }
}

const addCoupons = async(req,res)=>{
    try {
      console.log(req.body);  
        const coupon = new Coupon({
            couponName:req.body.couponName,
            couponCode:req.body.couponCode,
            discountValue:req.body.discountValue,
            minPurchase:req.body.minPurchase,
            maxDiscount:req.body.maxDiscount,
            expireDate:req.body.expireDate,
            limit:req.body.limit
        }) 

        const addCoup = await coupon.save();
        if(addCoup){
            console.log("coupon created successfully");
            res.redirect('/admin/coupons')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const deActivateCoupon = async(req,res)=>{
    try {
        await Coupon.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: false } })
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message);
    }
}

const activateCoupon = async(req,res)=>{
    try {
        await Coupon.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: true } })
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error.message);
    }
}

const userCouponRender = async (req,res)=>{
    try {
            username = req.session.userDatas.fname    
            const coup = await Coupon.find().lean()
            const coupons = coup.map((coupon)=>{
                const date = new Date(coupon.expireDate)
                const mainDate = date.toLocaleString()
                const id = coupon._id
                const couponName = coupon.couponName
                const couponCode =coupon.couponCode
                const discountValue = coupon.discountValue
                const minPurchase = coupon.minPurchase 
                return{expireDate:mainDate,id,couponName,couponCode,discountValue,minPurchase}
            })
        res.render('coupon',{user:true,coupons,username}) 
    } catch (error) {
        console.log(error.message);
        
    }
}

const applycoupon = async (req, res) => {
    try {
      console.log("applyreached");
      let code = req.body.code;
      console.log(code);
      let amount = req.body.amount;
      let userId = req.session.userDatas._id
      let userexist = await Coupon.findOne({
        couponCode: code,
        whoUsed: { $in: [userId] },
      }).lean()
      if (!userexist) {
        const couponData = await Coupon.findOne({ couponCode: code }).lean()
        if (couponData) {
          if (couponData.expireDate >= new Date() ) {
            
            if (couponData.limit >0) {
             
              if (couponData.minPurchase <= amount) {
                let discountvalue1 = couponData.discountValue;
                var discountAmount =Math.floor((discountvalue1/100)*amount)
                if (discountAmount>couponData.maxDiscount){
                    discountAmount=couponData.maxDiscount
                }
                let distotal = amount-discountAmount
                let discount = discountAmount
                let couponId = couponData._id;
                req.session.couponId = couponId;
                req.session.discount = discount

                req.session.coupon = code

                res.json({
                  couponokey: true,
                  distotal,
                  discount,
                  code,
                });
              } else {
                res.json({ cartamount: true });
              }
            } else {
              res.json({ limit: true });
            }
          } else {
            res.json({ expire: true });
          }
        } else {
          res.json({ invalid: true });
        }
      } else {
        res.json({ user: true });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

const deleteCoupon = async(req,res)=>{
    try {
    const couponId = req.query.id
    await Coupon.findByIdAndDelete(couponId)
    res.redirect('/admin/coupons')  
    } catch (error) {
      console.log(error.message);  
    }
}

const removeCoupon = async(req,res)=>{
  try {
    req.session.coupon = null
    req.session.couponId = null
    req.session.discount = null
    res.redirect('/checkout')
  } catch (error) {
    console.log(error.message);
  }               
}

module.exports={
    loadCoupons, 
    loadAddCoupons,
    addCoupons,
    deActivateCoupon,
    activateCoupon,
    userCouponRender,
    applycoupon,
    deleteCoupon,
    removeCoupon
}