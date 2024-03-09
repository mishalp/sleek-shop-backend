import express from 'express'
import { isSeller, isUser } from '../middlewares/auth.js'
import { createOrder, getAllSellerOrder, getAllUserOrder, updateOrderStatus } from '../controllers/order.js'

const router = express.Router()

router.post('/create', isUser, createOrder)

router.get('/all-seller', isSeller, getAllSellerOrder)

router.patch('/update-status/:orderId', isSeller, updateOrderStatus)

router.get('/all-user', isUser, getAllUserOrder)

export default router