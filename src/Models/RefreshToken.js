const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  tokenValue: String,
  linkedJWT: String,
  idUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expirationDate: {
    type: Date,
    expires: 0, // specifies that this model has a standalone exp date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
