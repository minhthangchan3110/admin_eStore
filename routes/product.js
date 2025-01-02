const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const multer = require("multer");
const { uploadProduct } = require("../uploadFile");
const asyncHandler = require("express-async-handler");

// Hàm chuyển chuỗi thành đối tượng
function parseSpecifications(specificationsString) {
  const specificationsObj = specificationsString
    .split("\r\n")
    .reduce((acc, item) => {
      const [key, value] = item.split(":");
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});

  return specificationsObj;
}

// Get all products
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const products = await Product.find()
        .populate("proCategoryId", "id name")
        .populate("proSubCategoryId", "id name")
        .populate("proBrandId", "id name")
        .populate("proVariantTypeId", "id type")
        .populate("proVariantId", "id name");
      res.json({
        success: true,
        message: "Products retrieved successfully.",
        data: products,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Get a product by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const productID = req.params.id;
      const product = await Product.findById(productID)
        .populate("proCategoryId", "id name")
        .populate("proSubCategoryId", "id name")
        .populate("proBrandId", "id name image")
        .populate("proVariantTypeId", "id name")
        .populate("proVariantId", "id name");
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }
      res.json({
        success: true,
        message: "Product retrieved successfully.",
        data: product,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Create new product
router.post(
  "/",
  asyncHandler(async (req, res) => {
    try {
      uploadProduct.fields([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
        { name: "image4", maxCount: 1 },
        { name: "image5", maxCount: 1 },
      ])(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            err.message =
              "File size is too large. Maximum filesize is 5MB per image.";
          }
          return res.json({ success: false, message: err.message });
        } else if (err) {
          return res.json({ success: false, message: err });
        }

        const {
          name,
          description,
          quantity,
          price,
          offerPrice,
          proCategoryId,
          proSubCategoryId,
          proBrandId,
          proVariantTypeId,
          proVariantId,
          specifications,
        } = req.body;

        if (
          !name ||
          !quantity ||
          !price ||
          !proCategoryId ||
          !proSubCategoryId
        ) {
          return res
            .status(400)
            .json({ success: false, message: "Required fields are missing." });
        }

        // Kiểm tra giá offer không được lớn hơn giá thường
        if (offerPrice && parseFloat(offerPrice) > parseFloat(price)) {
          return res.status(400).json({
            success: false,
            message: "Offer price cannot exceed the regular price.",
          });
        }

        // Kiểm tra tên sản phẩm đã tồn tại chưa
        const productExists = await Product.findOne({ name });
        if (productExists) {
          return res.status(400).json({
            success: false,
            message: "Product name already exists.",
          });
        }

        const specificationsObj = parseSpecifications(specifications);

        const imageUrls = [];
        const fields = ["image1", "image2", "image3", "image4", "image5"];
        fields.forEach((field, index) => {
          if (req.files[field] && req.files[field].length > 0) {
            const file = req.files[field][0];
            const imageUrl = `${process.env.BASE_URL}/image/products/${file.filename}`;
            console.log("Image URL:", imageUrl); // Log để kiểm tra URL
            imageUrls.push({ image: index + 1, url: imageUrl });
          }
        });

        const newProduct = new Product({
          name,
          description,
          quantity,
          price,
          offerPrice,
          proCategoryId,
          proSubCategoryId,
          proBrandId,
          proVariantTypeId,
          proVariantId,
          specifications: specificationsObj,
          images: imageUrls,
        });

        await newProduct.save();

        res.json({
          success: true,
          message: "Product created successfully.",
          data: null,
        });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const productId = req.params.id;
    try {
      uploadProduct.fields([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
        { name: "image4", maxCount: 1 },
        { name: "image5", maxCount: 1 },
      ])(req, res, async function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }

        const {
          name,
          description,
          quantity,
          price,
          offerPrice,
          proCategoryId,
          proSubCategoryId,
          proBrandId,
          proVariantTypeId,
          proVariantId,
          specifications,
        } = req.body;

        const productToUpdate = await Product.findById(productId);
        if (!productToUpdate) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found." });
        }

        // Kiểm tra giá offer không được lớn hơn giá thường
        if (offerPrice && parseFloat(offerPrice) > parseFloat(price)) {
          return res.status(400).json({
            success: false,
            message: "Offer price cannot exceed the regular price.",
          });
        }

        // Cập nhật các trường (không ghi đè giá trị rỗng)
        productToUpdate.name = name?.trim() || productToUpdate.name;
        productToUpdate.description =
          description?.trim() || productToUpdate.description;
        productToUpdate.quantity =
          quantity !== undefined ? quantity : productToUpdate.quantity;
        productToUpdate.price = price || productToUpdate.price;
        productToUpdate.offerPrice = offerPrice || productToUpdate.offerPrice;
        productToUpdate.proCategoryId =
          proCategoryId || productToUpdate.proCategoryId;
        productToUpdate.proSubCategoryId =
          proSubCategoryId || productToUpdate.proSubCategoryId;
        productToUpdate.proBrandId = proBrandId || productToUpdate.proBrandId;

        // Xử lý proVariantTypeId: Giữ nguyên giá trị hiện tại nếu không có dữ liệu
        // Xử lý proVariantTypeId: Giữ nguyên hoặc bỏ qua nếu không hợp lệ
        productToUpdate.proVariantTypeId =
          proVariantTypeId && proVariantTypeId !== "null"
            ? proVariantTypeId
            : productToUpdate.proVariantTypeId;

        // Xử lý proVariantId: Đảm bảo giữ nguyên nếu không được cập nhật
        if (proVariantId) {
          try {
            const parsedVariantId = JSON.parse(proVariantId);
            if (Array.isArray(parsedVariantId)) {
              productToUpdate.proVariantId = parsedVariantId;
            }
          } catch (e) {
            return res.status(400).json({
              success: false,
              message: "Invalid format for proVariantId.",
            });
          }
        }

        // Cập nhật specifications nếu có
        if (specifications) {
          const specificationsObj = parseSpecifications(specifications);
          productToUpdate.specifications = specificationsObj;
        }

        // Xử lý hình ảnh
        const fields = ["image1", "image2", "image3", "image4", "image5"];
        fields.forEach((field, index) => {
          if (req.files[field] && req.files[field].length > 0) {
            const file = req.files[field][0];
            const imageUrl = `${process.env.BASE_URL}/image/products/${file.filename}`;
            console.log("Image URL:", imageUrl); // Log để kiểm tra URL
            let imageEntry = productToUpdate.images.find(
              (img) => img.image === index + 1
            );
            if (imageEntry) {
              imageEntry.url = imageUrl;
            } else {
              productToUpdate.images.push({ image: index + 1, url: imageUrl });
            }
          }
        });

        await productToUpdate.save();
        res.json({ success: true, message: "Product updated successfully." });
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Delete a product
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const productID = req.params.id;
    try {
      const product = await Product.findByIdAndDelete(productID);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }
      res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

module.exports = router;
