const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("private.pem", "utf-8");
const BlackList = require("../Models/BlackList");

module.exports = async (req, res, next) => {
  // check for the refresh token in the cookies of the request (if not send back 401)
  const cookies = cookie.parse(req.headers.cookie || "");

  if (!cookies.refreshToken) {
    res.sendStatus(401);
    return;
  }

  try {
    // const foundToken = await BlackList.findOne({
    //   tokenValue: cookies.accessToken,
    // });
    if (foundToken) {
      res.sendStatus(401);

      return;
    }

    const payload = jwt.verify(cookies.accessToken, "cat");
    // if valid go next
    if (payload) {
      req.user = payload.idUser;
      let idUser = payload.idUser;
      res.json({ valid: true, idUser: idUser });
      return;
    }
  } catch (err) {
    console.log("checkValidity", err);
    next();
  }
};
