const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    home: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Home",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    sentiment: {
        type: String,
        enum: ["positive", "negative", "neutral"],
        default: "neutral"
    }
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);