const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const Order = require("../model/order");

// Get all orders
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("couponCode", "id couponCode discountType discountAmount")
        .populate("userID", "id email")  // Chỉ lấy email của user
        .sort({ _id: -1 });
      res.json({
        success: true,
        message: "Orders retrieved successfully.",
        data: orders,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

router.get(
  "/orderByUserId/:userId",
  asyncHandler(async (req, res) => {
    try {
      const userId = req.params.userId;
      const orders = await Order.find({ userID: userId })
        .populate("couponCode", "id couponCode discountType discountAmount")
        .populate("userID", "id email")  // Chỉ lấy email của user
        .sort({ _id: -1 });
      res.json({
        success: true,
        message: "Orders retrieved successfully.",
        data: orders,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Get an order by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const orderID = req.params.id;
      const order = await Order.findById(orderID)
        .populate("couponCode", "id couponCode discountType discountAmount")
        .populate("userID", "id email");  // Chỉ lấy email của user
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found." });
      }
      res.json({
        success: true,
        message: "Order retrieved successfully.",
        data: order,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Create a new order
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      userID,
      orderStatus,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      couponCode,
      orderTotal,
    } = req.body;
    if (
      !userID ||
      !items ||
      !totalPrice ||
      !shippingAddress ||
      !paymentMethod ||
      !orderTotal
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User ID, items, totalPrice, shippingAddress, paymentMethod, and orderTotal are required.",
      });
    }

    try {
      const order = new Order({
        userID,
        orderStatus,
        items,
        totalPrice,
        shippingAddress,
        paymentMethod,
        couponCode,
        orderTotal,
      });
      const newOrder = await order.save();
      res.json({
        success: true,
        message: "Đơn hàng được tạo thành công",
        data: null,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Update an order
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const orderID = req.params.id;
      const { orderStatus } = req.body;
      if (!orderStatus) {
        return res
          .status(400)
          .json({ success: false, message: "Yêu cầu trạng thái đơn hàng." });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderID,
        { orderStatus },
        { new: true }
      );

      if (!updatedOrder) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy đơn hàng." });
      }

      res.json({
        success: true,
        message: "Đơn hàng được cập nhật thành công.",
        data: null,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Delete an order
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const orderID = req.params.id;
      const deletedOrder = await Order.findByIdAndDelete(orderID);
      if (!deletedOrder) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy đơn hàng." });
      }
      res.json({ success: true, message: "Đơn hàng đã được xóa thành công." });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

module.exports = router;
