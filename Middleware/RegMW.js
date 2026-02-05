// const Express = require('express')
// const UserModel = require('../Schema/RegisterSchema')

// const RegMW = async (req, res, next) => {
//     try {
//         if (!req.session.user) {
//             return res.send({ success: false, message: "Please Login and try again" })
//         }

//         const fetchUser = await UserModel.findOne({ email: req.session.user.email })

//         if (!fetchUser) {
//             return res.send({ success: false, message: "User not found. Please Login and try again" })
//         }
//         next()

//     }
//     catch (err) {
//         console.log("Error in Fetching the session", err)
//     }
//     console.log("Session data:", req.session)

// }

// module.exports = RegMW;



const jwt = require("jsonwebtoken");
const UserModel = require("../Schema/RegisterSchema");

const RegMW = async (req, res, next) => {
    try {
        // 1️⃣ Get token from header
        const authHeader = req.headers.authorization;

        // 🔍 LOG #1 — check if token is coming
        console.log("AUTH HEADER:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Please login and try again"
            });
        }

        // 2️⃣ Extract token
        const token = authHeader.split(" ")[1];

        // 3️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        // 🔍 LOG #2 — check decoded data
        console.log("DECODED TOKEN:", decoded);


        // 4️⃣ Find user from DB
        const fetchUser = await UserModel.findOne({ email: decoded.email });

        if (!fetchUser) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again"
            });
        }

        // 5️⃣ Attach user to request
        req.user = fetchUser;

        console.log("HEADERS:", req.headers);

        next();
    } catch (err) {
        console.log("JWT Auth Error:", err);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = RegMW;
