const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  let token = null;

  // รองรับ Authorization: Bearer xxx
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  // รองรับ x-access-token (เผื่อใช้ร่วม)
  else if (req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
  }

  if (!token) {
    return res.status(401).json({ message: "Token is missing!" });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Access Forbidden" });
    }

    req.username = decoded.username;
    req.authorId = decoded.id;
    next();
  });


  console.log("AUTH HEADER:", req.headers.authorization);
console.log("X TOKEN:", req.headers["x-access-token"]);

};

module.exports = { verifyToken };
