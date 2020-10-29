const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const uuid4 = require("uuid4");
const fs = require("fs");
const privateKey = fs.readFileSync("private.key");

const RefreshToken = require("../Models/RefreshToken");
const BlackList = require("../Models/BlackList");

module.exports = async (req, res) => {
  // check for the refresh token in the cookies of the request (if not send back 401)
  const cookies = cookie.parse(req.headers.cookie || "");
  console.log(cookies);
  if (!cookies.refreshToken) {
    res.sendStatus(401);
    return;
  }

  // check validity of the refresh token in database
  const result = await RefreshToken.findOne({
    tokenValue: cookies.refreshToken,
  });

  if (!result) {
    res.sendStatus(401);
    return;
  }

  // check if the accessToken linked to the refreshToken in database is still valid (if send back 401 and delete refreshToken and put accessToken on blacklist)
  try {
    const decryptedLinkedJWT = jwt.verify(result.linkedJWT, privateKey, {
      algorithm: "RS256",
    });
    if (decryptedLinkedJWT) {
      await RefreshToken.remove({ _id: result._id });
      await BlackList.create({ tokenValue: result.linkedJWT });
      res.sendStatus(401);
      return;
    }
  } catch (error) {
    // if exists, generate a new accessToken and refreshToken resave them in database
    const newAccessToken = jwt.sign({ idUser: result.idUser }, privateKey, {
      expiresIn: 60 * 5,
      algorithm: "RS256",
    });

    const newRefreshToken = uuid4();

    let date = new Date();
    date.setMinutes(date.getMinutes() + 200);
    await RefreshToken.findOneAndUpdate(
      { tokenValue: cookies.refreshToken },
      {
        tokenValue: newRefreshToken,
        linkedJWT: newAccessToken,
        idUser: result.idUser,
        expirationDate: date,
      }
    );

    // Send back both new tokens to the client
    res.setHeader("Set-Cookie", [
      cookie.serialize("accessToken", String(newAccessToken), {
        httpOnly: true,
      }),
      cookie.serialize("refreshToken", String(newRefreshToken), {
        httpOnly: true,
      }),
    ]);
    res.sendStatus(200);
  }
};
