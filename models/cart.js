import mongoose, { Schema } from "mongoose"

const cartSchema = new mongoose.Schema({
    id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        id: { type: Schema.Types.ObjectId, ref: "Product" },
        count: { type: Number, default: 0 }
    }],
});

export default mongoose.model("Cart", cartSchema);