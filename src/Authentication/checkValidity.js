const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("private.key");
const RefreshToken = require("../Models/RefreshToken");
const BlackList = require("../Models/BlackList");

module.exports = async (req, res, next) => {
  // check for the refresh token in the cookies of the request (if not send back 401)
  const cookies = cookie.parse(req.headers.cookie || "");

  if (!cookies.refreshToken) {
    res.sendStatus(401);
    return;
  }

  try {
    const foundToken = await BlackList.findOne({
      tokenValue: cookies.accessToken,
    });
    if (foundToken) {
      res.sendStatus(401);
      return;
    }

    const payload = jwt.verify(cookies.accessToken, privateKey, { algorithms: "RS256" });
    // if valid go next
    if (payload) {
      req.user = payload.idUser;
      res.json({ valid: true });
      return;
    }
  } catch (err) {
    console.log(err);
    //check if the refresh token is still valid
    next();
  }
};
