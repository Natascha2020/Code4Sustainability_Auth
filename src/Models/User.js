const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  video: String,
  webpage: String,
  image: String,
  location: String,
  date: { type: Date, default: Date.now },
  question1: String,
  question2: String,
  question3: String,
  answer1: String,
  answer2: String,
  answer3: String,
  id_developer: { type: mongoose.Schema.Types.ObjectId, ref: "Developer" },
  id_project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  typeOfUser: String,
});

module.exports = mongoose.model("User", userSchema);
