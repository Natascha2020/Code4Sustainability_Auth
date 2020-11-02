require("dotenv").config();
require("./dbConfig");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// TO DELETE

const jwt = require("jsonwebtoken");
const fs = require("fs");
const privateKey = fs.readFileSync("private.key");

// TO DELETE

const generateAuth = require("./Authentication/generateAuth");
const refreshAuth = require("./Authentication/refreshAuth");
const verifyBlackList = require("./Authentication/verifyBlackList");
const checkValidity = require("./Authentication/checkValidity");
const deleteAuth = require("./Authentication/deleteAuth");
const app = express();
const port = process.env.PORT || 5001;

// Ensuring cors is working - TO ADD: Whitelist for ports
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, POST, PUT, DELETE, HEAD",
    allowHeaders: "Origin, X-Requested-With, Content-Type, Accept",
    exposedHeaders: "Content-Range,X-Content-Range",
    preflightContinue: true,
    credentials: true,
  })
);

// Middlewares to parse pody-text format as url encoded data/json received from client
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middlewares for generating access and refreshTokens, refreshing of tokens and blacklisting accessTokens
app.post("/generateAuth", generateAuth);

// To Delete
app.get("/test", async (req, res) => {
  const { access_token } = req.query;
  const validity = await jwt.verify(access_token, privateKey, { algorithm: "RS256" });
  res.json(validity);
});

// To Delete

app.get("/refreshAuth", refreshAuth);
app.get("/verifyBlackList", verifyBlackList);
app.get("/checkValidity", checkValidity, refreshAuth);
app.get("/deleteAuth", deleteAuth);

app.listen(port, () => console.log("Authentication server is running on port " + port));
