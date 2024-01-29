const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OTPScehma = new Schema(
  {
 
    otp: String,
  },
  {
    collection: "OTP",
  }

  );

module.exports = mongoose.model("OTP", OTPScehma);