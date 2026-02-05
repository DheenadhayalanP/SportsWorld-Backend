// ORDER SCHEMA

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: Number},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registrations', required: true }, // <-- Add this
    username: { type: String, required: true }, 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true }
});

const Orders = mongoose.model('Orders', orderSchema);

module.exports = Orders;

