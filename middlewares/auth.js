import jwt from "jsonwebtoken";
import Shop from "../models/shop.js";
import User from "../models/user.js";

export const isSeller = async (req, res, next) => {
    const bearerHeader = req.headers['seller'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {

            if (err) return res.status(403).json({ success: false, message: err.message })
            try {
                const shop = await Shop.findById(authData.id);
                if (!shop) return res.status(403).json({
                    success: false,
                    statusCode: 403,
                    message: "Invalid token"
                });
                req.seller = shop;
                next()
            } catch (error) {
                res.status(500).json({ error })
            }

        })
    } else {
        res.status(403).json({
            success: false,
            statusCode: 400,
            message: "Token not found"
        })
    }
}

export const isUser = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, authData) => {

            if (err) return res.status(403).json({ success: false, message: err.message })
            try {
                const user = await User.findById(authData.id);
                if (!user) return res.status(403).json({
                    success: false,
                    statusCode: 403,
                    message: "Invalid token"
                });
                req.user = user;
                next()
            } catch (error) {
                res.status(500).json({ error })
            }

        })
    } else {
        res.status(403).json({
            success: false,
            statusCode: 400,
            message: "Token not found"
        })
    }
}