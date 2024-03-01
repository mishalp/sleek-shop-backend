import express from 'express'
import { isUser } from '../middlewares/auth.js'
import { addToCart, decrementCount, getCart, incrementCount, removeFromCart, setCart } from '../controllers/cart.js'
const router = express.Router()

//setCart
router.post('/set-cart', isUser, setCart)

//Add to cart
router.patch('/add', isUser, addToCart)

//remove from cart
router.patch('/remove', isUser, removeFromCart)

//get cart
router.get('/get', isUser, getCart)

//Increment count
router.patch('/increment', isUser, incrementCount)

//Decrement count
router.patch('/decrement', isUser, decrementCount)

export default router