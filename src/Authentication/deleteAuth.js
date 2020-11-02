const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const privateKey = fs.readFileSync("private.key");
const RefreshToken = require("../Models/RefreshToken");
const BlackList = require("../Models/BlackList");

module.exports = async (req, res) => {
  // check if access token is send in cookies with request
  const cookies = cookie.parse(req.headers.cookie || "");
  if (!cookies.accessToken) {
    res.sendStatus(401);
    return;
  }
  // check the existence in the blacklist
  try {
    // check validity of the refresh token in database
    const result = await RefreshToken.findOne({
      tokenValue: cookies.refreshToken,
    });

    if (!result) {
      res.sendStatus(401);
      return;
    }

    // check if the accessToken linked to the refreshToken in database is still valid (if send back 401 and delete refreshToken and put accessToken on blacklist)

    const decryptedLinkedJWT = jwt.verify(result.linkedJWT, privateKey, { algorithm: "RS256" });

    if (decryptedLinkedJWT) {
      await RefreshToken.deleteOne({ _id: result._id });
      await BlackList.create({ tokenValue: result.linkedJWT });
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};
