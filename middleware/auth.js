const User = require('../models/userModel')


const isLogin = async(req,res,next)=>{
    try {
        if(req.session.userId){} 
        else{
            res.redirect('/login')
        }
        next()
           
    } catch (error) {
        console.log(error.message);
        
    }

}

const islogOut = async(req,res,next)=>{
    try {
        if(req.session.userId){
           res.redirect('/')
        }
        else{
           next()
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}

const ifUserLogged = async(req,res,next)=>{
    try {
        if(req.session.userId){
           const userStatus = await User.findById(req.session.userId)
           console.log(userStatus);
           if(userStatus.status==true){
             next()
           }else{
            req.session=null;
            res.redirect("/login")
           }
        }else{
            res.redirect("/")
        }
    } catch (error) {
        
    }
}



const isAdminlogin=async(req,res,next)=>{
    try {
        if( req.session.adminId ){ }
        else{
            res.redirect('/admin')
        }
        next();   
    }
     catch (error) {
       console.log(error.message); 
    }}



const isAdminlogout=async(req,res,next)=>{
    try {
        if( req.session.adminId ){
        
            res.redirect('/admin/home')
        }next()
    } catch (error) {
       console.log(error.message); 
    }}




module.exports ={
    isLogin,
    islogOut,
    ifUserLogged,
    isAdminlogin,
    isAdminlogout
}