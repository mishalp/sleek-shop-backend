import mongoose, { Schema } from "mongoose"

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your product name!"],
    },
    description: {
        type: String,
        required: [true, "Please enter your product description!"],
    },
    category: {
        type: String,
        required: [true, "Please enter your product category!"],
    },
    features: [{ type: String, required: [true, "Please include Features"] }],
    tags: {
        type: String,
    },
    originalPrice: {
        type: Number,
    },
    price: {
        type: Number,
        required: [true, "Please enter your product price!"],
    },
    stock: {
        type: Number,
        required: [true, "Please enter your product stock!"],
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    reviews: [
        {
            user: {
                type: Schema.Types.ObjectId, ref: "User"
            },
            rating: {
                type: Number,
            },
            comment: {
                type: String,
            },
            productId: {
                type: String,
            },
            createdAt: {
                type: Date,
                default: Date.now(),
            }
        },
    ],
    ratings: {
        type: Number,
    },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    sold_out: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

export default mongoose.model("Product", productSchema);