const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Đảm bảo email là duy nhất
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"], // Chỉ định giá trị hợp lệ
    default: "user", // Mặc định là người dùng bình thường
  },
  avatar: { type: String, default: "ecommerce-admin/avatar_default.png" },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

module.exports = User;
