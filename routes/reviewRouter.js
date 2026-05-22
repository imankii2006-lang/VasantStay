const express = require("express");
const reviewrouter = express.Router();
const reviewController = require("../controller/reviewController");

reviewrouter.post("/review", reviewController.createReview);

module.exports = reviewrouter;