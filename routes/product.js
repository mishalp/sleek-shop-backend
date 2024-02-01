import express from 'express'
import { createProduct, getAllProducts } from '../controllers/product.js'
import { isSeller } from '../middlewares/auth.js'

const router = express.Router()

//create product
router.post("/create", isSeller, createProduct)

//get All products
router.get("/all-prodcuts", getAllProducts)

export default router