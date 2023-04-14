import express from 'express'
import userModel from "../models/User.js"
import Usercontroller from '.././controllers/homeController.js'
import checkuser from '../middlewares/auth_middleware.js'
const router= express.Router()

// routerlevel middleware to protect route
router.use("/changepassword",checkuser)
router.use('/profile',checkuser)

// public route
router.post('/register',Usercontroller.userRegistration)
router.get("/register",(req,res,)=>{
    res.render("index")
   
})
router.get('/login',(req,res)=>{
    res.render("login")
})
router.post('/login', Usercontroller.userLogin)
router.post('/passwordreset',Usercontroller.sendUserPasswordResetEmail)
router.get('/passwordreset',(req,res)=>{
    res.render("passwordreset")
})
router.get('/api/user/reset/:id/:token',(req,res)=>{
    res.render("passwordresetpage")
})
router.post('/api/user/reset/:id/:token',Usercontroller.passwordResetPage)




// protected route
router.post('/changepassword',Usercontroller.changePassword)
router.get('/changepassword', (req,res)=>{
    res.render("changepassword")
})
router.get('/profile', (req,res)=>{
    res.render("profile")
})



    






export default router;