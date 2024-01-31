import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/utils.js";
import Shop from "../models/shop.js";

export const isSeller = async (req, res, next) => {
    const { sleek_seller_token } = req.cookies;
    if (!sleek_seller_token) return errorHandler({ statusCode: 401, message: "Please login to continue" }, res)

    jwt.verify(sleek_seller_token, process.env.JWT_SECRET_KEY, async (error, authData) => {
        try {
            if (error) return errorHandler(error, res)
            const seller = await Shop.findById(authData.id)
            if (!seller) return errorHandler({ statusCode: 403, message: "You are not seller" }, res)
            req.seller = seller
            next()
        } catch (error) {
            errorHandler(error, res)
        }
    })

}