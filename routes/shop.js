import express from 'express'
import { activateShop, loginShop, registerShop, verifySeller } from '../controllers/shop.js'
import { isSeller } from '../middlewares/auth.js'
const router = express.Router()

//new shop register
router.post('/register', registerShop)

//new shop activation
router.post('/activation', activateShop)

//shop login
router.post('/login', loginShop)

//verify seller
router.get('/verify', isSeller, verifySeller)

export default router