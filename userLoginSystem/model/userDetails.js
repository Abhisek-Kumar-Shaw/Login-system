const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserDetailsScehma = new Schema(
  {
    fname: String,
    lname: String,
    email: { type: String, unique: true },
    password: String,
    userType: String,
  },
  {
    collection: "UserInfo",
  }

  );

module.exports = mongoose.model("UserInfo", UserDetailsScehma);
