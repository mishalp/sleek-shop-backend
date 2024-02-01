import jwt from "jsonwebtoken";
import Shop from "../models/shop.js";

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