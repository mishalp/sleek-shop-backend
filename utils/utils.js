import jwt from 'jsonwebtoken'

export const createActivationToken = (data) => {
    return jwt.sign(data, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
};

export const errorHandler = (err, res) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    console.log(err);
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
}