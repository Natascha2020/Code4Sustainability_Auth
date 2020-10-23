const mongoose = require("mongoose");
//mongoose automatically runs by default on port 27017

//connection-String:
const mongoDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_COLL}.75mtd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

//connect to mongoose using db
const db = mongoose.connection;

//cind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

//ensuring connection
db.once("open", () => {
  console.info("Mongoose successfully connected");
});

module.exports = db;
