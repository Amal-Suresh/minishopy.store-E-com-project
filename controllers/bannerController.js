const Banner = require('../models/bannerModel')

const loadBanner = async(req,res)=>{
    try {
        const adminname = req.session.adminName
        const bannerData = await Banner.find().lean()
     res.render('banner',{admin:true,adminname,bannerData})   
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddBanner = async(req,res)=>{
    try {
        const adminname = req.session.adminName
        res.render('addbanner',{admin:true,adminname})   
    } catch (error) {
        console.log(error.message);
    }
}

const loadUpdateBanner = async(req,res)=>{
    try {
        const adminname = req.session.adminName
        const bannerId = req.query.id
        const bannerDetails = await Banner.findById(bannerId)
        res.render('updatebanner',{login:true,bannerDetails}) 
    } catch (error) {
        console.log(error.message);
    }
}




const addBanner = async(req,res)=>{
    try {
        // let img = []
        // for (const file of req.files) {
        //     const result = await cloudinary.uploader.upload(file.path)
        //     img.push(result.public_id)     
        // }
         const img = req.file.filename
        const banner = new Banner({
            title: req.body.title,
            subtitle: req.body.subtitle,
            image: img,
            url: req.body.btnurl,
            discription: req.body.discrip
        })

        console.log(banner);
        const bannerData = await banner.save();
            res.redirect("/admin/banner")  
    } catch (error) {
        console.log(error.message);
    }
}

const deleteBannerImg = async(req,res)=>{
    try {
        const id =req.query.id
        const image =req.query.image
         const deleteImg =await Banner.updateOne({_id:id},{
             $set: { image: '' } 
        })
       res.redirect(`/admin/updatebanner/?id=${id}`) 
        
    } catch (error) {
        console.log(error.message);
    }
}

const updateBanner = async(req,res)=>{
    try {
                const existingImg = await Banner.findById(req.body._id)
                let img
                if(existingImg.image){
                    img = existingImg.image
                }else{
                    img=req.file.filename  
                }
            await Banner.updateOne({ _id: req.body._id }, {
                $set: {
                    title: req.body.title,
                    subtitle: req.body.subtitle,
                    url: req.body.btnurl,
                    discription: req.body.discrip,
                    image: img,
                }
            })
            res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteBanner = async(req,res)=>{
    try {
        await Banner.findByIdAndDelete(req.query.id)
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}



const listBanner = async(req,res)=>{
    try {
       await Banner.findByIdAndUpdate(req.query.id,{$set:{status:false}}) 
       res.redirect('/admin/banner')  
    } catch (error) {
        console.log(error.message);
    }
}

const unlistBanner = async(req,res)=>{
    try {
        await Banner.findByIdAndUpdate(req.query.id,{$set:{status:true}}) 
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    addBanner,
    loadBanner,
    loadAddBanner,
    loadUpdateBanner,
    deleteBannerImg,
    listBanner,
    unlistBanner,
    updateBanner,
    deleteBanner
}