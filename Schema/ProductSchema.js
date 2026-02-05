const mongoose = require('mongoose');


const productSchema = mongoose.Schema({
    id: { type: Number, unique: true },
    product: { type: String, required: [true, "Product Name Is Required"] },
    price: { type: Number, required: [true, "Product Price Is Required"] },
    stock: { type: Number, required: [true, "Product Stock Is Required"] },
    // 👇 Home page image (ONLY ONE)
    coverImage: { type: String, required: true },
    // 👇 Product detail images (MULTIPLE)
    detailImages: [{ type: String }]
})

const Products = mongoose.model('Products', productSchema)

module.exports = Products;