const express = require('express');
const mongoose = require('mongoose');
const Product = require('../Schema/ProductSchema');
const Orders = require('../Schema/OrderSchema'); 
const Reg = require('../Middleware/RegMW');

const router = express.Router();

router.post('/create-order', Reg, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (productId === undefined || quantity === undefined) {
            return res.status(400).json({ success: false, message: "productId and quantity are required" });
        }

        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be an integer >= 1" });
        }

        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: "User not logged in" });
        }

        let productDoc = null;

        if (typeof productId === 'string' && mongoose.Types.ObjectId.isValid(productId)) {
            productDoc = await Product.findById(productId);
        }
        if (!productDoc) {
            const idNum = Number(productId);
            if (!Number.isNaN(idNum)) {
                productDoc = await Product.findOne({ id: idNum });
            }
        }

        if (!productDoc) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const pricePerUnit = Number(productDoc.price) || 0;
        const totalPrice = pricePerUnit * qty;


        const productNameSnapshot = productDoc.product || productDoc.name || productDoc.productName || "Unknown Product";


        const newOrder = new Orders({
            orderId: Date.now(),                  
            productId: productDoc._id,
            productName: productNameSnapshot,   
            username: user.name,                  
            userId: user._id,                    
            totalPrice: totalPrice,
            quantity: qty,
            createdAt: new Date()
        });

        const savedOrder = await newOrder.save();


        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            orderId: savedOrder._id
        });
        }
        catch (err) {
        console.error("Error in /create-order:", err);
        return res.status(500).json({
            success: false,
            message: "Server error while creating order",
            error: err.message
        });
    }
});



router.get('/my-orders', Reg, async (req, res) => {
    try {
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not logged in" });
        }

        const userId = req.user._id;


        const orders = await Orders.find({ userId }).sort({ createdAt: -1 }).lean();

        return res.status(200).json({ success: true, message: "Orders fetched", orders });
    } catch (err) {
        console.error("Error in /my-orders:", err);
        return res.status(500).json({ success: false, message: "Server error while fetching orders", error: err.message });
    }
});

// DELETE ORDER
router.delete("/delete-order/:id", Reg, async (req, res) => {
    try {
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID required" });
        }

        const deleted = await Orders.deleteOne({ _id: orderId });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Order removed successfully" });
    } catch (err) {
        console.error("Delete order error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});



module.exports = router;
