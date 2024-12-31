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
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); // Tìm người dùng theo email
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
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
// routes/user.js

// Create a new user
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const {
      email,
      password,
      confirmPassword,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and confirm password are required.",
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
      // Tạo người dùng mới
      const user = new User({
        email,
        password, // Không mã hóa mật khẩu ở đây
        avatar: "ecommerce-admin/avatar_default.png", // Avatar mặc định
        phone,
        street,
        city,
        state,
        postalCode,
        country,
      });

      // Lưu người dùng vào cơ sở dữ liệu
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
// routes/user.js

// Update a user
router.put(
  "/:id",
  uploadUserAvatar.single("avatar"),
  asyncHandler(async (req, res) => {
    try {
      const userID = req.params.id;
      const {
        name,
        email,
        password,
        new_password,
        confirm_new_password,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        role, // Thêm trường role vào đây
      } = req.body;

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

      // Cập nhật các trường dữ liệu nếu có
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (street) updateData.street = street;
      if (city) updateData.city = city;
      if (state) updateData.state = state;
      if (postalCode) updateData.postalCode = postalCode;
      if (country) updateData.country = country;
      if (role) updateData.role = role; // Cập nhật role nếu có

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
