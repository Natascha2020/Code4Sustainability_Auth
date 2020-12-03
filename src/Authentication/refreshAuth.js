const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const uuid4 = require("uuid4");
const fs = require("fs");
const privateKey = fs.readFileSync("private.pem");

const RefreshToken = require("../Models/RefreshToken.js");
const Blacklist = require("../Models/Blacklist.js");

module.exports = async (req, res) => {
  // check for the refresh token in the cookies of the request (if not send back 401)
  const cookies = cookie.parse(req.headers.cookie || "");
  if (!cookies.refreshToken) {
    res.sendStatus(401);
    return;
  }
  console.log("cookies refresh", cookies);
  // check validity of the refresh token in database
  const result = await RefreshToken.findOne({
    tokenValue: cookies.refreshToken,
  });

  if (!result) {
    res.sendStatus(401);
    return;
  }

  // check if the accessToken linked to the refreshToken in database is still valid (if send back 401 and delete refreshToken and put accessToken on blacklist)

  const newAccessToken = jwt.sign({ idUser: result.idUser }, "cat", {
    expiresIn: 5,
  });
  const newRefreshToken = uuid4();
  await RefreshToken.findByIdAndUpdate(result._id, {
    tokenValue: newRefreshToken,
    linkedJWT: newAccessToken,
    idUser: result.idUser,
  });
  console.log("refresh", newRefreshToken);
  // Send back both new tokens to the client
  res.setHeader("Set-Cookie", [
    cookie.serialize("accessToken", String(newAccessToken), {
      httpOnly: true,
      SameSite: "none",
      secure: true,
    }),
    cookie.serialize("refreshToken", String(newRefreshToken), {
      httpOnly: true,
      SameSite: "none",
      secure: true,
    }),
  ]);
  res.cookie("NewJWT", accessToken, {
    httpOnly: true,
  });
  res.json({ idUser: result.idUser });
};

// const cookie = require("cookie");
// const jwt = require("jsonwebtoken");
// const uuid4 = require("uuid4");
// const fs = require("fs");
// const privateKey = fs.readFileSync("private.pem");

// const RefreshToken = require("../Models/RefreshToken");
// const BlackList = require("../Models/BlackList");

// module.exports = async (req, res) => {
//   // check for the refresh token in the cookies of the request (if not send back 401)
//   const cookies = cookie.parse(req.headers.cookie || "");
//   if (!cookies.refreshToken) {
//     res.sendStatus(401);
//     return;
//   }

//   console.log(cookies.refreshToken);

//   // check validity of the refresh token in database
//   const result = await RefreshToken.findOne({
//     tokenValue: cookies.refreshToken,
//   });

//   console.log(result);
//   if (!result) {
//     res.sendStatus(401);
//     return;
//   }

//   // check if the accessToken linked to the refreshToken in database is still valid (if send back 401 and delete refreshToken and put accessToken on blacklist)
//   try {
//     const decryptedLinkedJWT = jwt.verify(result.linkedJWT, "cat");
//     console.log(decryptedLinkedJWT);
//     if (decryptedLinkedJWT) {
//       // await RefreshToken.remove({ _id: result._id });
//       // await BlackList.create({ tokenValue: result.linkedJWT });
//       res.sendStatus(401);
//       return;
//     }
//   } catch (error) {
//     const newAccessToken = jwt.sign({ idUser: result.idUser }, "cat", {
//       expiresIn: 5,
//     });
//     const newRefreshToken = uuid4();
//     await RefreshToken.findOneAndUpdate(
//       { tokenValue: cookies.refreshToken },
//       {
//         tokenValue: newRefreshToken,
//         linkedJWT: newAccessToken,
//         idUser: result.idUser,
//       }
//     );
//     // Send back both new tokens to the client
//     res.setHeader("Set-Cookie", [
//       cookie.serialize("accessToken", String(newAccessToken), {
//         httpOnly: true,
//       }),
//       cookie.serialize("refreshToken", String(newRefreshToken), {
//         httpOnly: true,
//       }),
//     ]);
//     res.json({ idUser: result.idUser });
//   }
// };
