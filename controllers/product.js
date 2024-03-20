import joi from "joi"
import cloudinary from 'cloudinary'
import Product from "../models/product.js"
import Order from "../models/order.js"

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
                return next(error)
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
        const products = await Product.find().populate("shop reviews.user")
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
    if (!req.seller) return next({ statusCode: 400, message: "Seller Error" })
    const sellerId = req.seller._id
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

export const editProduct = async (req, res, next) => {
    if (!req.seller) return next({ statusCode: 400, message: "Seller Error" })
    const sellerId = req.seller._id
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
    const productId = req.params.id
    try {
        const data = await schema.validateAsync(req.body)
        const dbImages = await Product.findById(productId).select("images -_id")
        const savedImages = data.images.filter(item => item.slice(0, 5) === "https")
        let newImages = [];
        let deleteImages = [];
        let uploadImages = data.images.filter(item => !(item.slice(0, 5) === "https"))
        let imageChanged = true
        if (dbImages.images.length === data.images) {
            let flag = false
            dbImages.images.forEach((item, i) => {
                if (data.images[i] !== item.url) {
                    flag = true
                }
            })
            if (!flag) {
                imageChanged = false
            }
        }
        if (imageChanged) {
            if (savedImages.length > 0) {
                for (let i = 0; i < dbImages.images.length; i++) {
                    let flag = false
                    let index = null;
                    let j
                    for (j = 0; j < savedImages.length; j++) {
                        if (savedImages[j] === dbImages.images[i].url) {
                            flag = true;
                            index = j
                            break
                        }
                    }
                    if (flag) {
                        newImages.push(dbImages.images[i])
                        savedImages.splice(j, 1)
                        index = null
                    } else {
                        deleteImages.push(dbImages.images[i])
                    }
                }
            } else {
                deleteImages = dbImages.images
            }
        }
        for (let i = 0; i < uploadImages.length; i++) {
            const result = await cloudinary.v2.uploader.upload(uploadImages[i], {
                folder: "products",
                timeout: 120000,
            });
            newImages.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        if (deleteImages.length > 0) {
            let ids = deleteImages.map(item => item.public_id)
            await cloudinary.v2.api.delete_resources(ids, { timeout: 120000 })
        }

        data.images = newImages;
        data.shop = sellerId

        const product = await Product.findByIdAndUpdate(productId, data, { returnDocument: 'after' }).populate("shop")

        return res.status(200).json({
            success: true,
            message: "Product Updated succesfully",
            product
        })


    } catch (error) {
        console.log(error);
        return next(error);
    }
}

export const addReview = async (req, res, next) => {
    const user = req.user
    try {
        const { rating, comment, prodId, orderId } = req.body
        const product = await Product.findById(prodId)

        const isReviewed = product.reviews.find(item => user._id === item.user)
        if (isReviewed) {
            product.reviews.forEach(item => {
                if (item.user === user._id) {
                    item.rating = rating
                    item.comment = comment
                }
            })
        } else {
            product.reviews.push({
                user: user._id,
                rating,
                comment,
                productId: prodId
            })
        }

        let avg = 0;

        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });

        product.ratings = avg / product.reviews.length;

        await product.save()

        await Order.findByIdAndUpdate(
            orderId,
            { $set: { "cart.$[elem].isReviewed": true } },
            { arrayFilters: [{ "elem._id": prodId }], new: true }
        );

        res.status(200).json({
            success: true,
            message: "Reviwed succesfully!",
        });

    } catch (error) {
        next(error)
    }
}