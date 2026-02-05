const Express = require('express')
const Register = require('../Schema/RegisterSchema')
const Reg = require('../Middleware/RegMW')
const nodemailer = require('nodemailer')
const Routers = Express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const jwt = require("jsonwebtoken");
const { countDocuments } = require('../Schema/OrderSchema')
 

// upload folder
const uploadDir = path.join(__dirname, "..", "upload");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});


const uploads = multer({
    storage: storage,
    limits: { fileSize: 7 * 1024 * 1024 } // 7 MB
});


// ✅ REGISTER USER WITH PROFILE PIC
Routers.post('/register-user', uploads.single('profilePic'), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "All fields required" });
        }

        const exists = await Register.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Email already registered" });
        }

        const lastUser = await Register.findOne({}).sort({ id: -1 });
        const newId = lastUser ? lastUser.id + 1 : 1;

        const profilePicPath = req.file ? `/upload/${req.file.filename}` : null;

        const newUser = new Register({
            id: newId,
            name,
            email,
            password,
            profilePic: profilePicPath
        });

        await newUser.save();

        return res.json({
            success: true,
            message: "Registered successfully",
            user: newUser
        });

    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});




// Upload multiple images under field name "images"
Routers.post("/upload-images", uploads.array("images", 5), async (req, res) => {
    try {
        // req.files is an array of file objects
        console.log("Files:", req.files);
        console.log("Body:", req.body); // any extra text fields

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }

        // Build array of public URLs (or relative paths)
        const filePaths = req.files.map(f => `/upload/${f.filename}`);

        // TODO: if you want, save filePaths to MongoDB here

        return res.status(201).json({
            success: true,
            message: "Images uploaded successfully",
            files: filePaths
        });
    } catch (err) {
        console.error("Error in /upload-images:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});




Routers.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return res.send({ success: false, message: "All fileds are required" })

        const User = await Register.findOne({ email: email })

        if (!User) {
            return res.send({ success: false, message: "User Not Found. Register and Try again" })
        }

        if (User.password !== password) {
            return res.send({ success: false, message: "Invalid Password" })
        } 
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSKEY
            }
        });


        const mailOptions = {
            from: "yourgmail@gmail.com",
            to: email,
            subject: "Sample mail verification",
            text: `Successfully verification is done`
        };

        try {
            await transporter.sendMail(mailOptions);

            // req.session.user = {
            //     _id: User._id,
            //     name: User.name,
            //     email: User.email
            // }

            // if (!req.session.user) {
            //     return res.send({ success: false, message: "Data Not Stored in Session" })
            // }

            const token = jwt.sign(
                {
                    id: User._id,
                    name: User.name,
                    email: User.email
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.send({
            success: true,
            message: "Login Successfully and Mail send",
            token: token,
            datas: {
                _id: User._id,
                name: User.name,
                email: User.email
            }
        });

            // return res.send({ success: true, message: "Login Successfully and Mail send", datas: req.session.user })

        } catch (err) {
            console.error("OTP email error:", err);
            res.status(500).json({
                success: false,
                message: "Failed to send OTP",
                error: err.message
            });
        }
    }
    catch (err) {
        console.log("Error in Register", err)
    }
})

Routers.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false });
    }

    res.json({
        success: true,
        user: req.session.user
    });
});

// Get User...

Routers.get('/get-user', Reg, async(req, res) =>
{
    try
    {
    const Alluser = await Register.find()

    if(!Alluser || Alluser.length === 0)
        {
            return res.send({success:false, message:"User Not found"})
        }
        return res.send({success:true, message:"Data Fetched", users:Alluser})
    }
    catch(err)
    {
        console.log("Error in fetch:",err)
    }
})

// Get User By ID...

Routers.get('/get-user/:id',async(req, res) =>
{
    try
    {
        const id = Number(req.params.id)

        if(!id)
            return res.send({success:false, message:"Id Not Found"})

        const Alluser = await Register.findOne({id:id})    

        if(!Alluser)
        {
            return res.send({success:false, message:"User Not Found"})
        }
            return res.send({success:true, message:"Data Fetched", users:Alluser})
    }
    catch(err)
    {
        console.log("Error in fetch:",err)
    }
})

// Update User...

Routers.put('/update-user/:id', async(req,res) =>
{
    try{
        const id = Number(req.params.id)

        if(!id)
            return res.send({success:false, message:"Id not found"})

        const Alluser = await Register.findOne({id:id})

        if(!Alluser)
        {
            return res.send({success:false, message:"User Not found"})
        }

        const {name, email, password} = req.body

        if(!name || !email || !password)
            return res.send({success:false, message:"All fields are required"})

            const updateUser = await Register.updateOne({id:id},
            {
                $set:
                {
                    name :name,
                    email:email,
                    password:password
                }
            }
        )

        if(updateUser.modifiedCount > 0)
            return res.send({success:true, message:"Data updated Successfully"})
        else
            return res.send({success:false, message:"Data Not Updated"})
    }
    catch(err)
    {
       console.log("Error in Update :",err)
    }
})

// Delete User...

Routers.delete('/delete-user/:id', async(req, res) =>
{
    try{
        const id = Number(req.params.id)

        if(!id)
            return res.send({success:false, message:"Id not found"})

        const deleteUser = await Register.deleteOne({ id: id})    

    if(deleteUser.deletedCount > 0)
    {
        return res.send({success :true, message:" User Deleted Successfully"})
    }
    else
    {
        return res.send({success :false, message:"User not found"})
    }
    }
    catch(err)
    {
        console.log("Error in fetch:",err)
        return res.send({success :false, message:"Trouble in deleting the user"})
    }
})



// LOGOUT
Routers.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid"); // session cookie
        return res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
});



module.exports = Routers



// Aggregate => $match - filter
// $match :{

// }
// $limit :{},
// $sort:{},
// $in:[{},{},{}]
// $and : [{compaany :1}, []]
// $project :{
//     _id:1,
//     comapny:1,
//     location:1
// }
// $group:{
//     _id:,
// count 
// },
// countDocuments()















