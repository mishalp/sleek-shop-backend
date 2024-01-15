import Shop from '../models/shop.js'
import joi from 'joi'
import { createActivationToken, getImageData } from '../utils/utils.js'
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

        if (isEmail) next({ statusCode: 400, message: "User already exists" })

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
        console.log(error);
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

        if (!newSeller) next({ statusCode: 400, message: "Invalid Token" })

        const { name, email, phone, address, zip, password, avatar } = newSeller;

        let seller = await Shop.findOne({ email: email });
        if (seller) next({ statusCode: 400, message: "Email already exists" })

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
        new (error)
    }
}