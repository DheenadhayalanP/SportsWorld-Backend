const mongoose = require('mongoose');



const registerSchema = mongoose.Schema({
    id:{type:Number, unique:true},
    name:{type:String, required: [true, "Name is required"]},
    email: {type:String, required: [true, "Email is required"], unique: true},
    password :{type:String, required: [true, "Password is required"]},
    profilePic: { type: String }
})
 
const Register = mongoose.model('Registrations', registerSchema)


module.exports = Register;