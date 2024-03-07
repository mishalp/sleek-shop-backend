import express from 'express'
import { createPaymentIntent } from '../controllers/payment.js'
import { isUser } from '../middlewares/auth.js'

const router = express.Router()

router.post('/create-intent', isUser, createPaymentIntent)

export default router