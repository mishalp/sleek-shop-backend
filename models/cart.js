import mongoose, { Schema } from "mongoose"

const cartSchema = new mongoose.Schema({
    id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        item: { type: Schema.Types.ObjectId, ref: "Product" },
        count: { type: Number, default: 1 },
    }],
});

export default mongoose.model("Cart", cartSchema);