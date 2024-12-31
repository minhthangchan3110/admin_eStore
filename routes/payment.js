const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

// for stripe payment gateway
const stripe = require("stripe")(process.env.STRIPE_SKRT_KET_TST);

// for razorpay payment gateway
const razorpay = require("razorpay");

// for vn_pay payment gateway
const VNPAY = require("vnpay");

// Stripe route
router.post(
  "/stripe",
  asyncHandler(async (req, res) => {
    try {
      console.log("Received data:", req.body); // Log dữ liệu nhận được
      const { email, name, address, amount, currency, description } = req.body;

      const customer = await stripe.customers.create({
        email: email,
        name: name,
        address: address,
      });

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2023-10-16" }
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        customer: customer.id,
        description: description,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PBLK_KET_TST,
      });
    } catch (error) {
      console.log(error);
      return res.json({ error: true, message: error.message, data: null });
    }
  })
);

// VNPay route
router.post(
  "/vnpay",
  asyncHandler(async (req, res) => {
    try {
      console.log("VNPay route");

      const { orderId, amount, orderDescription, returnUrl, notifyUrl } =
        req.body;

      const vnpay = new VNPAY({
        vnp_TmnCode: process.env.VNPAY_TMN_CODE,
        vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
        vnp_Url: process.env.VNPAY_URL,
      });

      // Create payment URL
      const paymentUrl = await vnpay.createPaymentUrl({
        orderId: orderId,
        amount: amount,
        orderDescription: orderDescription,
        returnUrl: returnUrl,
        notifyUrl: notifyUrl,
      });

      res.json({
        paymentUrl: paymentUrl,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: true, message: error.message, data: null });
    }
  })
);

module.exports = router;
