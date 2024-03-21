import express from 'express'
import { activateShop, getShopInfo, loginShop, registerShop, verifySeller } from '../controllers/shop.js'
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

router.get('/get-shop/:id', getShopInfo)

export default router