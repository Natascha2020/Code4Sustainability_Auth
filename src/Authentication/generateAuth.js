const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uuid4 = require("uuid4");
const cookie = require("cookie");
const fs = require("fs");
const privateKey = fs.readFileSync("private.pem", "utf-8");

const User = require("../Models/User.js");
const RefreshToken = require("../Models/RefreshToken.js");

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
    const accessToken = jwt.sign({ idUser: result._id }, "cat", {
      expiresIn: 60 * 60 * 3600,
      /* expiresIn: 5, */
    });

    // Generate refresh token - UUID4
    const refreshToken = uuid4();

    // Save refresh token in database with the jwt linked
    let date = new Date();
    date.setMinutes(date.getMinutes() + 120);
    await RefreshToken.create({
      tokenValue: refreshToken,
      linkedJWT: accessToken,
      idUser: result._id,
      expirationDate: date,
    });

    console.log(accessToken, refreshToken);
    // Send back both tokens to the client and save in coolies with httpOnly flag
    res.setHeader("Set-Cookie", [
      cookie.serialize("accessToken", String(accessToken), {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        path: "/",
      }),
      cookie.serialize("refreshToken", String(refreshToken), {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        path: "/",
      }),
    ]);

    cookie.defaults = {
      sameSite: "None",
      httpOnly: true,
      secure: true,
      domain: ".c4s-app.herokuapp.com",
    };

    res.send(accessToken);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};
