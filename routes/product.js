import express from 'express'
import { getAllproducts } from '../controllers/product.js'

const router = express.Router()

router.get("/", getAllproducts)

export default router