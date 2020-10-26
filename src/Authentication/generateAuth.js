const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid4 = require("uuid4");
const cookie = require("cookie");
const fs = require("fs");
const privateKey = fs.readFileSync("private.key");

const User = require("../Models/User");
const RefreshToken = require("../Models/RefreshToken");

module.exports = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.length || !password || !password.length) res.status(400);

  try {
    const result = await User.findOne({ email: email });
    if (!result) {
      res.sendStatus(400);
      return;
    }

    const passwordMatch = await bcrypt.compare(password, result.password);
    if (!passwordMatch) {
      res.sendStatus(400);
      return;
    }

    // Generate access token - JWT
    const accessToken = jwt.sign({ idUser: result._id }, privateKey, {
      expiresIn: 5 * 60,
      algorithm: "RS256",
    });

    // Generate refresh token - UUID4
    const refreshToken = uuid4();

    // Save refresh token in database with the jwt linked
    let date = new Date();
    date.setMinutes(date.getMinutes() + 60);
    await RefreshToken.create({
      tokenValue: refreshToken,
      linkedJWT: accessToken,
      idUser: result._id,
      expirationDate: date,
    });

    // Send back both tokens to the client and save in coolies with httpOnly flag
    res.setHeader("Set-Cookie", [
      cookie.serialize("accessToken", String(accessToken), {
        httpOnly: true,
      }),
      cookie.serialize("refreshToken", String(refreshToken), {
        httpOnly: true,
      }),
    ]);
    res.send(accessToken);
  } catch (err) {
    console.log("TestD");
    console.log(err);
    res.sendStatus(400);
  }
};
