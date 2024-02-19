import jwt from "jsonwebtoken";
import Shop from "../models/shop.js";
import User from "../models/user.js";

export const isSeller = async (req, res, next) => {
    const { sleek_seller_token } = req.cookies;
    if (!sleek_seller_token) return next()

    jwt.verify(sleek_seller_token, process.env.JWT_SECRET_KEY, async (error, authData) => {
        try {
            if (error) return next()
            const seller = await Shop.findById(authData.id)
            if (!seller) return next()
            req.seller = seller
            next()
        } catch (error) {
            next()
        }
    })
}

export const isUser = async (req, res, next) => {
    const { sleek_token } = req.cookies;
    if (!sleek_token) return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Cookie not found"
    })

    jwt.verify(sleek_token, process.env.JWT_SECRET_KEY, async (error, authData) => {
        try {
            if (error) return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Invalid Cookie"
            })
            const user = await User.findById(authData.id)
            if (!user) return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Invalid Cookie"
            })
            req.user = user
            next()
        } catch (error) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Invalid Cookie"
            })
        }
    })
}