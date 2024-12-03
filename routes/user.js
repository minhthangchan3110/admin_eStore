const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const User = require("../model/user");
const { uploadUserAvatar } = require("../uploadFile");

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Cho phép tiếp tục nếu là admin
  } else {
    res.status(403).json({ success: false, message: "Access denied." });
  }
};

// Get all users
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const users = await User.find();
      res.json({
        success: true,
        message: "Users retrieved successfully.",
        data: users,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Login
router.post("/login", async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid name or password." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access this application.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Login successful.", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a user by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const userID = req.params.id;
      const user = await User.findById(userID);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
      res.json({
        success: true,
        message: "User retrieved successfully.",
        data: user,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Create a new user
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and confirm password are required.",
      });
    }

    // Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    try {
      const user = new User({
        name,
        email,
        password, // Không mã hóa mật khẩu ở đây
        avatar: "ecommerce-admin/avatar_default.png",
      });
      const newUser = await user.save();
      res.json({
        success: true,
        message: "User created successfully.",
        data: newUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Update a user
router.put(
  "/:id",
  uploadUserAvatar.single("avatar"),
  asyncHandler(async (req, res) => {
    try {
      const userID = req.params.id;
      const { name, email, password, new_password, confirm_new_password } =
        req.body;

      // Tìm người dùng để cập nhật
      const user = await User.findById(userID);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }

      // Kiểm tra mật khẩu cũ
      if (password && password !== user.password) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect.",
        });
      }

      // Kiểm tra xác nhận mật khẩu mới
      if (new_password && new_password !== confirm_new_password) {
        return res.status(400).json({
          success: false,
          message: "New passwords do not match.",
        });
      }

      // Tạo một đối tượng để lưu trữ dữ liệu cập nhật
      const updateData = {};

      // Cập nhật name và email nếu có
      if (name) {
        updateData.name = name;
      }
      if (email) {
        updateData.email = email;
      }

      // Cập nhật mật khẩu nếu có
      if (new_password) {
        updateData.password = new_password; // Không mã hóa mật khẩu mới
      }

      // Cập nhật avatar nếu có
      if (req.file) {
        updateData.avatar = req.file.path;
      }

      // Kiểm tra có dữ liệu nào để cập nhật không
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No fields to update.",
        });
      }

      // Cập nhật thông tin người dùng trong DB
      const updatedUser = await User.findByIdAndUpdate(userID, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: "User updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Delete a user
router.delete(
  "/:id",

  asyncHandler(async (req, res) => {
    try {
      const userID = req.params.id;
      const deletedUser = await User.findByIdAndDelete(userID);
      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
      res.json({ success: true, message: "User deleted successfully." });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

module.exports = router;
