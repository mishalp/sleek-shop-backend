import Cart from '../models/cart.js'
import { mongo } from 'mongoose'

const ObjectId = mongo.ObjectId

export const getCart = async (req, res, next) => {
    const user = req.user
    try {
        const cart = await Cart.findOne({ id: user._id })
        console.log(cart);
        res.status(200).json({
            success: true,
            cart: cart || []
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

export const setCart = async (req, res, next) => {
    const user = req.user
    try {
        const cart = await Cart.findOneAndUpdate({ id: user._id }, { items: req.body }, { upsert: true, returnDocument: 'after' })
        res.status(200).json({
            success: true,
            cart
        })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

export const addToCart = async (req, res, next) => {
    const user = req.user
    try {
        await Cart.updateOne({ id: user._id }, { $push: { items: { id: new ObjectId(req.body.id) } } }, { upsert: true })
        res.status(200).json({
            success: true,
        })
    } catch (error) {
        next(error)
    }
}

export const removeFromCart = async (req, res, next) => {
    const user = req.user
    try {
        await Cart.findOneAndUpdate({ id: user._id }, { "$pull": { "items": { "id": new ObjectId(req.body.id) } } })
        res.status(200).json({
            success: true,
        })
    } catch (error) {
        next(error)
    }
}