const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const privateKey = fs.readFileSync("private.pem", "utf-8");
const Blacklist = require("../Models/Blacklist.js");

module.exports = async (req, res, next) => {
  // check for the refresh token in the cookies of the request (if not send back 401)
  const cookies = cookie.parse(req.headers.cookie || "");

  if (!cookies.refreshToken) {
    res.sendStatus(401);
    return;
  }

  try {
    const foundToken = await Blacklist.findOne({
      tokenValue: cookies.accessToken,
    });
    if (foundToken) {
      res.sendStatus(401);

      return;
    }

    const payload = jwt.verify(cookies.accessToken, "cat");
    // if valid go next
    if (payload) {
      req.user = payload.idUser;
      let idUser = payload.idUser;
      //test
      res.setHeader("Set-Cookie", [
        cookie.serialize("accessToken", String(cookies.accessToken), {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        }),
        cookie.serialize("refreshToken", String(cookies.refreshToken), {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        }),
      ]);

      cookie.defaults = {
        sameSite: "None",
        httpOnly: true,
        secure: true,
        domain: ".c4s-app.herokuapp.com",
      };
      //test
      res.json({ valid: true, idUser: idUser });
      return;
    }
  } catch (err) {
    console.log("checkValidity", err);
    next();
  }
};
