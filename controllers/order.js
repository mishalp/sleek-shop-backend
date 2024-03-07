import Order from '../models/order.js'

export const createOrder = async (req, res, next) => {
    try {
        const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

        //   group cart items by shopId
        const shopItemsMap = new Map();

        for (const item of cart) {
            const shop = item.shop;
            if (!shopItemsMap.has(shop)) {
                shopItemsMap.set(shop, []);
            }
            shopItemsMap.get(shop).push(item);
        }

        // create an order for each shop
        const orders = [];

        for (const [shop, items] of shopItemsMap) {
            const order = await Order.create({
                cart: items.map(item => ({
                    ...item.item,
                    qty: item.count
                })),
                shippingAddress,
                user,
                totalPrice,
                paymentInfo,
            });
            orders.push(order);
        }

        res.status(201).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.log(error);
        return next(error)
    }
}

export const getAllSellerOrder = async (req, res, next) => {

    try {
        const seller = req.seller
        if (!seller) return next({ statusCode: 400, message: "Seller Error" })
        const orders = await Order.find({ "cart.shop._id": seller._id.valueOf() }).sort({
            createdAt: -1,
        })
        res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        next(error)
    }
}