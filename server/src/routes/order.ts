import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  confirmOrder,
  getAllOrders,
  updateOrderPrice,
  updateOrderStatus,
  getStats,
} from "../controllers/orderController";
import { authenticate, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticate, createOrder);
router.get("/my", authenticate, getMyOrders);

// Admin routes
router.get("/admin/all", authenticate, isAdmin, getAllOrders);
router.put("/admin/:id/price", authenticate, isAdmin, updateOrderPrice);
router.put("/admin/:id/status", authenticate, isAdmin, updateOrderStatus);
router.get("/admin/stats", authenticate, isAdmin, getStats);

router.get("/:id", authenticate, getOrderById);
router.put("/:id/confirm", authenticate, confirmOrder);

export default router;
