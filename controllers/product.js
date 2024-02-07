import joi from "joi"
import cloudinary from 'cloudinary'
import Product from "../models/product.js"

export const createProduct = async (req, res, next) => {
    if (!req.seller) return next({ statusCode: 400, message: "Seller Error" })
    const schema = joi.object({
        name: joi.string().required(),
        description: joi.string().required(),
        features: joi.array().items(joi.string()).min(3).required(),
        images: joi.array().items(joi.string()).min(1).required(),
        originalPrice: joi.number(),
        price: joi.number().required(),
        stock: joi.number().required(),
        category: joi.string().required()
    })
    try {
        const data = await schema.validateAsync(req.body)
        const imageLinks = []
        for (let i = 0; i < data.images.length; i++) {
            try {
                const result = await cloudinary.v2.uploader.upload(data.images[i], {
                    folder: "products",
                    timeout: 120000
                });
                imageLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            } catch (error) {
                next(error)
            }
        }

        data.images = imageLinks
        data.shop = req.seller._id

        const product = await Product.create(data)

        res.status(200).json({
            success: true,
            message: "Product added succesfully",
            product
        })

    } catch (error) {
        next(error)
    }
}

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find().populate("shop")
        res.status(200).json({
            success: true,
            products
        })
    } catch (error) {
        next(error)
    }

}

export const getShopProducts = async (req, res, next) => {
    const sellerId = req.params.id
    if (!sellerId) return next({ statusCode: 400, message: "Seller Error" })

    try {
        const products = await Product.find({ shop: sellerId }).populate("shop")

        res.status(200).json({
            success: true,
            products
        })

    } catch (error) {
        next(error)
    }
}

export const deleteProduct = async (req, res, next) => {
    const sellerId = req.seller._id
    if (!sellerId) return next({ statusCode: 400, message: "Seller Error" })
    const productId = req.params.id
    try {
        const product = await Product.findOneAndDelete({ shop: sellerId, _id: productId })
        await cloudinary.v2.api.delete_resources(product.images.map(item => item.public_id))
        res.status(200).json({
            success: true,
            message: "Product Successfully deleted"
        })
    } catch (error) {
        next(error)
    }
}