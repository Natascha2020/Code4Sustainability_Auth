const mongoose = require("mongoose");

const BlacklistSchema = new mongoose.Schema({
  tokenValue: String,
});

module.exports = mongoose.model("Blacklist", BlacklistSchema);
