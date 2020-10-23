const mongoose = require("mongoose");

const BlackListSchema = new mongoose.Schema({
  tokenValue: String,
});

module.exports = mongoose.model("BlackList", BlackListSchema);
