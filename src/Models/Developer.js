const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const developerSchema = new Schema({
  email: String,
  projects_pending: [String],
  projects_matched: [String],
});

module.exports = mongoose.model("Developer", developerSchema);
