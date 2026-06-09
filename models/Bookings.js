const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
 homeId: { type: mongoose.Schema.Types.ObjectId, ref: "Home" },
  amount: Number,
  paymentId: String,
  orderId: String,
  status: { type: String, default: "Confirmed" },
  checkIn:{
    type:Date,
    required:true
  },
  checkOut:{
    type:Date,
    required:true
},
guests: {
  type: Number,  
  default: 1
},
cancelledAt:{
  type:Date
}
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);