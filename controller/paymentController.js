const mongoose = require("mongoose");

const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Bookings");
const Home= require("../models/home");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 🔹 STEP 1: Order create
module.exports.createOrder = async (req, res) => {
  const { amount } = req.body;

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR"
  });

  res.json(order);
};

// 🔹 STEP 2: Payment verify + save
module.exports.verifyPayment = async (req, res) => {
  const { order_id, payment_id, signature, homeId, amount, checkIn, checkOut, guests } = req.body;
  

  const body = order_id + "|" + payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected === signature) {
    await Booking.create({
      user: req.session.user._id,
      homeId: new mongoose.Types.ObjectId(String(homeId).trim()),
      amount:Number(amount),
      paymentId: payment_id,
      orderId: order_id,
      checkIn: checkIn,   // <--- Ab ye database mein jayega
      checkOut: checkOut, // <--- Ab ye database mein jayega
      guests: Number(guests)
    });

    
    

    res.send("Success");
  } else {
    res.status(400).send("Failed");
  }
};