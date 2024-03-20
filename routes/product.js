import express from 'express'
import {
    addReview,
    createProduct,
    deleteProduct,
    editProduct,
    getAllProducts,
    getShopProducts
} from '../controllers/product.js'
import { isSeller, isUser } from '../middlewares/auth.js'

const router = express.Router()

//create product
router.post("/create", isSeller, createProduct)

//get All products
router.get("/all-prodcuts", getAllProducts)

//get products of shop
router.get("/shop-products/:id", getShopProducts)

//delete product
router.delete("/delete/:id", isSeller, deleteProduct)

//edit product
router.patch("/edit/:id", isSeller, editProduct)

//review product
router.patch("/add-review", isUser, addReview)

export default router