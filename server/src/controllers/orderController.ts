import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';

export const createOrder = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const openid = req.user.openid;
        const order = new Order({
            ...req.body,
            openid,
            status: 'pending'
        });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: 'Error creating order' });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const openid = req.user.openid;
        const orders = await Order.find({ openid }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        // Join with User to get nickname/avatar
        // Since we store openid, we can manually aggregate or use two queries
        // or populate if we used ref (but User ID is _id, Order stores openid string, usually)
        // Let's check User model. User._id is ObjectID. Order.openid is String.
        // So we can't simple populate. We can look up by openid.
        
        const orders = await Order.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 100 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'openid',
                    foreignField: 'openid',
                    as: 'userInfo'
                }
            },
            {
                $unwind: {
                    path: '$userInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    recipe: 1,
                    style: 1,
                    quantity: 1,
                    originalPrice: 1,
                    finalPrice: 1,
                    expressCompany: 1,
                    expressNumber: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userInfo: {
                        nickName: 1,
                        avatarUrl: 1
                    }
                }
            }
        ]);
        
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching all orders' });
    }
};

export const updateOrderPrice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { finalPrice } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            id, 
            { finalPrice, status: 'wait_confirm' },
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error updating price' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, expressCompany, expressNumber } = req.body;
        
        const updateData: any = { status };
        if (expressCompany) updateData.expressCompany = expressCompany;
        if (expressNumber) updateData.expressNumber = expressNumber;

        const order = await Order.findByIdAndUpdate(
            id, 
            updateData,
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error updating status' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        // Implement stats logic similar to cloud function if needed
        const totalOrders = await Order.countDocuments();
        // ... more stats
        res.json({ totalOrders });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stats' });
    }
};
