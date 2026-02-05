import { Request, Response } from "express";
import Order from "../models/Order";

export const createOrder = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const openid = req.user.openid;
    const order = new Order({
      ...req.body,
      openid,
      status: "pending",
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: "Error creating order" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const openid = req.user.openid;
    const orders = await Order.find({ openid }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const openid = req.user.openid as string;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (order.openid !== openid) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Error fetching order" });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, month, year } = req.query;

    const matchStage: any = {};

    // Filter by status (single or comma-separated)
    if (status) {
      const statuses = (status as string).split(",");
      matchStage.status = { $in: statuses };
    }

    // Filter by month/year
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const orders = await Order.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "openid",
          foreignField: "openid",
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true,
        },
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
            avatarUrl: 1,
          },
        },
      },
    ]);

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching all orders" });
  }
};

export const updateOrderPrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { finalPrice } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { finalPrice, status: "wait_confirm" },
      { new: true },
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Error updating price" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, expressCompany, expressNumber } = req.body;

    const updateData: any = { status };
    if (expressCompany) updateData.expressCompany = expressCompany;
    if (expressNumber) updateData.expressNumber = expressNumber;

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Error updating status" });
  }
};

export const confirmOrder = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const openid = req.user.openid as string;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    if (order.openid !== openid) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    if (order.status !== "wait_confirm") {
      res.status(400).json({ error: "Invalid order status" });
      return;
    }
    order.status = "confirmed";
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Error confirming order" });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();

    // 1. Monthly Stats: Total Sales, Paid Amount, Pending Amount
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: { $ifNull: ["$finalPrice", "$originalPrice"] } },
          paidAmount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["paid", "producing", "shipped", "received"],
                  ],
                },
                { $ifNull: ["$finalPrice", "$originalPrice"] },
                0,
              ],
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [
                { $in: ["$status", ["pending", "wait_confirm", "confirmed"]] },
                { $ifNull: ["$finalPrice", "$originalPrice"] },
                0,
              ],
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // 2. Pending Payment Details (List of orders waiting for payment)
    // We can fetch this separately or the frontend can use filtering on the order list.
    // But for "clicking to view details", returning a list of pending orders here might be heavy if there are many.
    // Better approach: The frontend should call /api/orders/admin/all?status=pending (need to implement filter support)
    // For now, let's return a simplified list of pending orders for quick view if needed, or just the stats.

    // Let's stick to returning stats here.
    // To "view details", the frontend should navigate to the order list with a filter.

    // 3. Status Distribution (Existing)
    const statusDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalOrders,
      monthlyStats,
      statusDistribution,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Error fetching stats" });
  }
};
