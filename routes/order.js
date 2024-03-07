import express from 'express'
import { isSeller, isUser } from '../middlewares/auth.js'
import { createOrder, getAllSellerOrder } from '../controllers/order.js'

const router = express.Router()

router.post('/create', isUser, createOrder)

router.get('/all-seller', isSeller, getAllSellerOrder)

export default router