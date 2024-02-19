import User from '../models/user.js'
import Cart from '../models/cart.js'
import joi from 'joi'
import { createActivationToken } from '../utils/utils.js'
import cloudinary from 'cloudinary'
import sendMail from '../utils/sendMail.js'
import jwt from 'jsonwebtoken'
import sendToken from '../utils/sendToken.js'

export const registerUser = async (req, res, next) => {
    const schema = joi.object({
        name: joi.string().min(2).max(20).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        avatar: joi.any().required()
    })
    try {
        const data = await schema.validateAsync(req.body)
        const { email, avatar, name, password } = data;
        const isEmail = await User.findOne({ email: email })

        if (isEmail) return next({ statusCode: 400, message: "User with this email already exists" })

        // const image = await getImageData(avatar)
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
        });

        const user = {
            name,
            email,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
            password
        }

        const activationToken = createActivationToken(user)
        const activationURL = `${process.env.CLIENT}/user/activation/${activationToken}`
        await sendMail({
            email: user.email,
            subject: "Activate your User",
            message: `Hello ${user.name}, please click on the link to activate your shop: ${activationURL}`,
        });
        res.status(201).json({
            success: true,
            message: `please check your email:- ${user.email} to activate your shop!`,
        });

    } catch (error) {
        next(error)
    }
}

export const activateUser = async (req, res, next) => {
    try {
        const { activationToken } = req.body;

        const newUser = jwt.verify(
            activationToken,
            process.env.ACTIVATION_SECRET
        );

        if (!newUser) return next({ statusCode: 400, message: "Invalid Token" })

        const { name, email, password, avatar } = newUser;

        let user = await User.findOne({ email: email });
        if (user) return next({ statusCode: 400, message: "Email already exists" })

        user = await User.create({
            name,
            email,
            password,
            avatar
        })

        sendToken(user, 201, res)

    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
    })

    try {
        const data = await schema.validateAsync(req.body)
        const { email, password } = data;

        const user = await User.findOne({ email })
        if (!user) return next({ statusCode: 400, message: "User with this email not found" })

        const isPasswordCorrect = await user.comparePassword(password)
        if (!isPasswordCorrect) return next({ statusCode: 400, message: "Incorrect password" })

        const cart = await Cart.findOne({ id: user._id })

        // sendToken(user, 201, res, cart)

        const token = user.getJwtToken();

        // Options for cookies
        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: "none",
            secure: true
        };

        res.status(201).cookie("sleek_token", token, options).json({
            success: true,
            user,
            cart: cart.items,
            token,
        });

    } catch (error) {
        console.log(error);
        next(error)
    }
}

export const verifyUser = (req, res, next) => {
    const user = req.user
    const { sleek_token } = req.cookies
    res.status(200).json({
        success: true,
        user: user,
        token: sleek_token
    })
}