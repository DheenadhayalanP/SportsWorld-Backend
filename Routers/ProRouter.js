const Express = require('express')
const Products = require('../Schema/ProductSchema')
const Reg = require('../Middleware/RegMW')

const ProRouters = Express.Router()


const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

const upload = multer({ storage });

// ✅ CREATE PRODUCT WITH IMAGES
ProRouters.post( "/product", Reg,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "detailImages", maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const { product, price, stock } = req.body;

      const lastProduct = await Products.findOne().sort({ id: -1 });
      const ProductID = lastProduct ? lastProduct.id + 1 : 1;

      const coverImage = req.files.coverImage?.[0];
      const detailImages = req.files.detailImages || [];

      const newProduct = new Products({
        id: ProductID,
        product,
        price,
        stock,
        coverImage: `/upload/${coverImage.filename}`,
        detailImages: detailImages.map(f => `/upload/${f.filename}`)
      });

      await newProduct.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  }
);


// Get Product...

ProRouters.get('/get-product', async (req, res) => {
    try {
        const Allproduct = await Products.find()

        if (!Allproduct.length) {
            return res.send({ success: false, message: "Product Not found" })
        }
        return res.send({ success: true, message: "Data Fetched", products: Allproduct })
    }
    catch (err) {
        console.log("Error in fetching product:", err)
    }
})

// Get Product By ID...

ProRouters.get('/get-product/:id', async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id))
            return res.send({ success: false, message: "Id Not Found" })

        const Allproducts = await Products.findOne({ id: id })

        if (!Allproducts) {
            return res.send({ success: false, message: "Product Not Found" })
        }
        return res.send({ success: true, message: "Data Fetched", products: Allproducts })
    }
    catch (err) {
        console.log("Error in fetch:", err)
    }
})

// Update Product...

ProRouters.put('/update-product/:id', Reg, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send({ success: false, message: "ID not provided" });
        }

        const product = await Products.findOne({ id });

        if (!product) {
            return res.status(404).send({ success: false, message: "Product not found" });
        }

        const { product: productName, price } = req.body;

        if (!productName || !price) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        const updateProduct = await Products.updateOne(
            { id },
            {
                $set: {
                    product: productName,
                    price: price
                }
            }
        );

        if (updateProduct.modifiedCount > 0) {
            return res.status(200).send({ success: true, message: "Product updated successfully" });
        }
        else {
            return res.status(200).send({ success: false, message: "No changes made" });
        }
    }
    catch (err) {
        console.error("Error in update:", err);
        return res.status(500).send({ success: false, message: "Server error while updating product" });
    }
});


// Delete Product...

ProRouters.delete('/delete-product/:id', Reg, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send({ success: false, message: "ID not provided" });
        }

        const deleteProduct = await Products.deleteOne({ id });

        if (deleteProduct.deletedCount > 0) {
            return res.status(200).send({ success: true, message: "Product deleted successfully" });
        }
        else {
            return res.status(404).send({ success: false, message: "Product not found" });
        }
    }
    catch (err) {
        console.error("Error in delete:", err);
        return res.status(500).send({ success: false, message: "Server error while deleting product" });
    }
});




module.exports = ProRouters