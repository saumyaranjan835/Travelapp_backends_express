import  userModel  from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import transporter from "../config/emailconfig.js";

class Usercontroller{
    static userRegistration =async (req, res)=>{
      
        const {name,email,password,password_confirmation}=req.body
        const user= await userModel.findOne({email:email})
        if(user){
            res.send({"status":"failed","msg":"Email already exists"})
        }
        else{
            if(name&& email&&password&&password_confirmation){

                if(password===password_confirmation){
                   try {
                    const salt= await bcrypt.genSalt(10)
                    const hashpassword= await bcrypt.hash(password,salt)
                    const doc= new userModel({
                        name:name,
                        password:hashpassword,
                        email:email           
                    })
                    await doc.save()
                    const saved_user=await userModel.findOne({email:email})
                    // Generate jwt token
                    const token = jwt.sign({userid:saved_user._id},process.env.JWT_SECRET_KEY, {expiresIn:'5d'})

                    res.status(201).send({"status":"success","msg":"Registration successful", "token":token })

                   } catch (error) {
                    console.log(error)
                    res.send({"status":"failed","msg":"Unable to Registered"})
                   }
                }
                else{
                    res.send({"status":"failed","msg":"Password and Password Confirmation does not match"})
                }

            }
            else{
                res.send({"status":"failed","msg":"All fields are required"})
            }
        }
      } 

    static userLogin= async (req,res)=>{
        const {email,password}=req.body
        const user= await userModel.findOne({email:email})
        const isMatch= await bcrypt.compare(password,user.password)
        if (email&&password){
            if (user != null){
                if (email==user.email&&isMatch){
                    // Generate token for login
                    const token = jwt.sign({userid:user._id},process.env.JWT_SECRET_KEY, {expiresIn:'5d'})

                    res.send({"status":"success","msg":"login successful", "token":token})
                    res.redirect('/profile')
    
                }
                else{
                    res.send({"status":"failed","msg":"Email or Password is not valid"})
                }
            }
            else{
                res.send({"status":"failed","msg":"Email not registered"})
            }
            
        }
        else{
            res.send({"status":"failed","msg":"All fields are required"})
        }
    }


    static changePassword=async (req,res)=>{
        const {password,password_confirmation}=req.body
        if (password&&password_confirmation){
            if (password==password_confirmation){
                const salt= await bcrypt.genSalt(10)
                const newhashpassword= await bcrypt.hash(password,salt)
                //Update password
                await userModel.findByIdAndUpdate(req.user._id,{$set:{password:newhashpassword}})
                res.send({"status":"success","msg":"New password updated successfully"})
            }
            else{
                res.send({"status":"failed","msg":"New Password and New Confirm Password does not match"})
            }
           
        }
        else{
            res.send({"status":"failed","msg":"All fields required"})
        }
    }



      static sendUserPasswordResetEmail=async (req,res)=>{
        const {email}=req.body
        if(email){
            const user= await userModel.findOne({email:email})
            if(user){
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({userid:user._id},secret,{expiresIn:'15m'})
                // create front_end link
                const link=`http://127.0.0.1:8000/api/user/reset/${user._id}/${token}`
                const info = await transporter.sendMail({
                    from:process.env.EMAIL_FROM,
                    to: user.email,
                    subject:'Ganitravel Password Reset',
                    html:`<a href=${link}>click here</a>Password Reset`

                })
                res.send({"status":"success","msg":"Please check your email for link",'info':info})
               
            }
            else{
                res.send({"status":"failed","msg":"Unauthorized Email entered"})
            }

        }
        else{
            res.send({"status":"failed","msg":"Email fields required"})
        }

      }



      static passwordResetPage=async (req,res)=>{
        const {password,password_confirmation}=req.body
        const {id, token}= req.params
        const user= await userModel.findById(id)
        const new_secret_key = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token,new_secret_key)
            if(password&&password_confirmation){
                if ( password==password_confirmation){
                    const salt= await bcrypt.genSalt(10)
                    const newhashpassword= await bcrypt.hash(password,salt)
                    //Update password
                    await userModel.findByIdAndUpdate(user._id,{$set:{password:newhashpassword}})
                    res.send({"status":"success","msg":"Password reset successfully"})

                }
                else{
                    res.send({"status":"failed","msg":"New Password and New Confirm Password does not match"})
                }

            }
            else{
                res.send({"status":"failed","msg":"All fields required"})
            }


        } catch (error) {
            console.log(error)
            res.send({"status":"failed","msg":"Invalid token"})

        }

      }
    }

    






export default Usercontroller;
