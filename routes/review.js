const express = require("express");
const router = express.Router();
const Review = require("../model/review");
const asyncHandler = require("express-async-handler");
const multer = require("multer");

// Lấy tất cả các đánh giá
// Lấy tất cả các đánh giá
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const reviews = await Review.find({}).populate("userId", "email"); // Populate email của userId

      res.json({
        success: true,
        message: "Reviews retrieved successfully.",
        data: reviews,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Lấy đánh giá theo productId
// Lấy đánh giá theo productId
router.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    try {
      const reviews = await Review.find({
        productId: req.params.productId,
      }).populate("userId", "email"); // Populate email của userId

      if (reviews.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No reviews found for this product.",
        });
      }

      res.json({
        success: true,
        message: "Reviews retrieved successfully.",
        data: reviews,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Thêm một đánh giá mới
router.post(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const { productId, userId, rating, comment } = req.body;

      // Kiểm tra nếu thông tin cần thiết không có
      if (!productId || !userId || !rating) {
        return res.status(400).json({
          success: false,
          message: "Please provide productId, userId, and rating.",
        });
      }

      const newReview = new Review({
        productId,
        userId,
        rating,
        comment,
      });

      const savedReview = await newReview.save();

      res.json({
        success: true,
        message: "Thêm đánh giá thành công .",
        data: savedReview,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Cập nhật đánh giá theo ID
router.put(
  "/:reviewId",
  asyncHandler(async (req, res) => {
    try {
      const review = await Review.findById(req.params.reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found.",
        });
      }

      const { rating, comment } = req.body;

      // Cập nhật các trường đánh giá
      if (rating) review.rating = rating;
      if (comment) review.comment = comment;

      const updatedReview = await review.save();

      res.json({
        success: true,
        message: "Review updated successfully.",
        data: updatedReview,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Xóa đánh giá theo ID
router.delete(
  "/:reviewId",
  asyncHandler(async (req, res) => {
    try {
      const review = await Review.findById(req.params.reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found.",
        });
      }

      await review.remove();

      res.json({
        success: true,
        message: "Review deleted successfully.",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

module.exports = router;
