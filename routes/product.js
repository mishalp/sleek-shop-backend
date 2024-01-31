import express from 'express'
import { createProduct } from '../controllers/product.js'
import { isSeller } from '../middlewares/auth.js'

const router = express.Router()

router.post("/create", isSeller, createProduct)

export default router