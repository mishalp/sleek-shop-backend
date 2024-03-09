// create token and saving that in cookies
const sendToken = (user, statusCode, res, cart) => {
    const token = user.getJwtToken();

    // Options for cookies
    const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
        secure: true
    };

    res.status(statusCode).json({
        success: true,
        user: { ...user, cart },
        token,
    });
};

export default sendToken