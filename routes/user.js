import express from 'express'
import { activateUser, loginUser, registerUser, verifyUser } from '../controllers/user.js'
import { isUser } from '../middlewares/auth.js'
const router = express.Router()

//new user register
router.post('/register', registerUser)

//new user activation
router.post('/activation', activateUser)

//user login
router.post('/login', loginUser)

//verify user
router.get('/verify', isUser, verifyUser)

export default router