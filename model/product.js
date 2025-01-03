const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
    },
    proCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    proSubCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    proBrandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    proVariantTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VariantType",
    },

    proVariantId: {
      type: [String],
    },

    images: [
      {
        image: {
          type: Number,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    specifications: {
      type: Map,
      of: String, // hoặc bạn có thể dùng loại dữ liệu khác nếu cần
      required: false, // tùy chọn, nếu thông số là bắt buộc, có thể thay đổi thành true
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
