import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const shopSchema = new mongoose.Schema({
    name: {
        required: [true, "Please enter your shop name!"],
        type: String,
    },
    phone: {
        required: [true, "Please enter your phone!"],
        type: Number
    },
    email: {
        required: [true, "Please enter your email!"],
        type: String,
        unique: true,
    },
    address: {
        required: [true, "Please enter your address!"],
        type: String
    },
    zip: {
        required: [true, "Please enter your zip code!"],
        type: String
    },
    password: {
        required: [true, "Please enter your address!"],
        type: String,
        minLength: [6, "Password must be at least 6 characters"]
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
}, { timestamps: true })

// Hash password
shopSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
shopSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

// comapre password
shopSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


export default mongoose.model("Shop", shopSchema);