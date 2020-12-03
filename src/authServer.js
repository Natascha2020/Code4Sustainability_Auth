/* require("dotenv").config(); */
require("./dbConfig.js");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const generateAuth = require("./Authentication/generateAuth.js");
const refreshAuth = require("./Authentication/refreshAuth.js");
/* const verifyBlacklist = require("./Authentication/verifyBlacklist.js"); */
const checkValidity = require("./Authentication/checkValidity.js");
const deleteAuth = require("./Authentication/deleteAuth.js");
const app = express();
const port = process.env.PORT || 5001;

// Ensuring cors is working - TO ADD: Whitelist for ports
app.use(
  cors({
    origin: "https://c4s-app.herokuapp.com",
    methods: "GET, POST, PUT, DELETE, HEAD",
    allowHeaders: "Origin, X-Requested-With, Content-Type, Accept",
    exposedHeaders: ["Content-Range", "X-Content-Range", "set-cookie"],
    preflightContinue: true,
    credentials: true,
  })
);

// Middlewares to parse pody-text format as url encoded data/json received from client
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//to delete
const cookieParser = require("cookie-parser");
app.use(cookieParser());
//to delete

// Middlewares for generating access and refreshTokens, refreshing of tokens and blacklisting accessTokens
app.post("/generateAuth", generateAuth);

app.get("/refreshAuth", refreshAuth);
/* app.get("/verifyBlacklist", verifyBlacklist); */
app.get("/checkValidity", checkValidity, refreshAuth);
app.get("/deleteAuth", deleteAuth);

app.listen(port, () => console.log("Authentication server is running on port " + port));
