const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const privateKey = fs.readFileSync("private.pem");
const RefreshToken = require("../Models/RefreshToken.js");
const Blacklist = require("../Models/Blacklist.js");

module.exports = async (req, res) => {
  // check if access token is send in cookies with request

  const cookies = cookie.parse(req.headers.cookie || "");
  console.log(cookies);
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

    const decryptedLinkedJWT = jwt.verify(result.linkedJWT, process.env.SEC);

    if (decryptedLinkedJWT) {
      console.log("in if statement", decryptedLinkedJWT);
      await RefreshToken.deleteOne({ _id: result._id });
      await Blacklist.create({ tokenValue: result.linkedJWT });
      res.setHeader("Set-Cookie", [
        cookie.serialize("accessToken", "", {
          httpOnly: true,
        }),
        cookie.serialize("refreshToken", "", {
          httpOnly: true,
        }),
      ]);
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};
