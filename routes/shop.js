import express from 'express'
import { activateShop, registerShop } from '../controllers/shop.js'
const router = express.Router()

//new shop register
router.post('/register', registerShop)

//new shop activation
router.post('/activation', activateShop)

export default router