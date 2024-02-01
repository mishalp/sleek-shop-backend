import Shop from '../models/shop.js'
import joi from 'joi'
import { createActivationToken } from '../utils/utils.js'
import cloudinary from 'cloudinary'
import sendMail from '../utils/sendMail.js'
import jwt from 'jsonwebtoken'
import sendShopToken from '../utils/shopToken.js'

export const registerShop = async (req, res, next) => {
    const schema = joi.object({
        name: joi.string().min(2).max(20).required(),
        phone: joi.string().min(10).required(),
        email: joi.string().email().required(),
        address: joi.string().min(3).required(),
        zip: joi.string().min(6).required(),
        password: joi.string().min(6).required(),
        avatar: joi.any().required()
    })
    try {
        const data = await schema.validateAsync(req.body)
        const { email, avatar, name, phone, address, zip, password } = data;
        const isEmail = await Shop.findOne({ email: email })

        if (isEmail) return next({ statusCode: 400, message: "User with this email already exists" })

        // const image = await getImageData(avatar)
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
        });

        const seller = {
            name,
            phone,
            email,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
            address,
            zip,
            password
        }

        const activationToken = createActivationToken(seller)
        const activationURL = `${process.env.CLIENT}/seller/activation/${activationToken}`
        await sendMail({
            email: seller.email,
            subject: "Activate your Shop",
            message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationURL}`,
        });
        res.status(201).json({
            success: true,
            message: `please check your email:- ${seller.email} to activate your shop!`,
        });

    } catch (error) {
        next(error)
    }
}

export const activateShop = async (req, res, next) => {
    try {
        const { activationToken } = req.body;

        const newSeller = jwt.verify(
            activationToken,
            process.env.ACTIVATION_SECRET
        );

        if (!newSeller) return next({ statusCode: 400, message: "Invalid Token" })

        const { name, email, phone, address, zip, password, avatar } = newSeller;

        let seller = await Shop.findOne({ email: email });
        if (seller) return next({ statusCode: 400, message: "Email already exists" })

        seller = await Shop.create({
            name,
            email,
            phone,
            address,
            zip,
            password,
            avatar
        })

        sendShopToken(seller, 201, res)

    } catch (error) {
        next(error)
    }
}

export const loginShop = async (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
    })

    try {
        const data = await schema.validateAsync(req.body)
        const { email, password } = data;

        const seller = await Shop.findOne({ email })
        if (!seller) return next({ statusCode: 400, message: "User with this email not found" })

        const isPasswordCorrect = await seller.comparePassword(password)
        if (!isPasswordCorrect) return next({ statusCode: 400, message: "Incorrect password" })

        sendShopToken(seller, 201, res)

    } catch (error) {
        console.log(error);
        next(error)
    }
}

export const verifySeller = (req, res, next) => {
    const { sleek_seller_token } = req.cookies
    const seller = req.seller
    if (!seller) return next({ statusCode: 400, message: "Seller Error" })
    res.status(200).json({
        success: true,
        user: seller,
        token: sleek_seller_token
    })
}