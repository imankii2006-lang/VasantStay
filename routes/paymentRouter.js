const express = require("express");
const paymentrouter = express.Router();
const paymentController = require("../controller/paymentController");

paymentrouter.post("/payment/create-order", paymentController.createOrder);
paymentrouter.post("/payment/verify", paymentController.verifyPayment);

module.exports = paymentrouter;