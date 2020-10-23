const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  email: String,
  developers_pending: [String],
  developers_matched: [String],
});

module.exports = mongoose.model("Project", projectSchema);
