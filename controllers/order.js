import Order from '../models/order.js'
import Product from '../models/product.js'

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
        const orders = await Order.find({ "cart.shop": seller._id.valueOf() }).sort({
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

export const updateOrderStatus = async (req, res, next) => {
    try {
        const seller = req.seller
        if (!seller) return next({ statusCode: 400, message: "Seller Error" })

        const { orderId } = req.params
        const order = await Order.findById(orderId)
        if (!order) return next({ statusCode: 400, message: "Order not found" })

        if (req.body.status === "Transferred to delivery partner") {
            order.cart.forEach(async item => {
                const product = await Product.findById(item._id)
                product.stock -= item.qty
                product.sold_out += item.qty
                await product.save()
            })
        }

        order.status = req.body.status

        if (req.body.status === "Delivered") {
            order.paymentInfo.status = "Succeeded"
            order.deliveredAt = Date.now()
            seller.availableBalance += (order.totalPrice - (order.totalPrice * .10))
            await seller.save()
        }

        await order.save()

        res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        next(error)
    }
}

export const getAllUserOrder = async (req, res, next) => {

    try {
        const user = req.user
        if (!user) return next({ statusCode: 400, message: "User Error" })
        const orders = await Order.find({ "user.id": user._id.valueOf() }).sort({
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