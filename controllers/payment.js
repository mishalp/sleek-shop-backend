
import Stripe from "stripe"

const stripe = new Stripe('sk_test_51N903kSHsyZXhUAqWWyuR96jYIU8hIABEqGZWGU2PfhyYTUFQbriWPkst7muBJuLNjKWvdAbZvfeVl1XTJQvXPWx00RHAsA1rd')


const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
};

export const createPaymentIntent = async (req, res, next) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "inr",
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            metadata: {
                company: "Sleek Shope",
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.log(error);
        next(error)
    }
}