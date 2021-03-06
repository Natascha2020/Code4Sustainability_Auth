const cookie = require("cookie");
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
    const foundToken = await BlackList.findOne({
      tokenValue: cookies.accessToken,
    });
    // if it exists send 401
    if (foundToken) {
      res.sendStatus(401);
      return;
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
  }
};
