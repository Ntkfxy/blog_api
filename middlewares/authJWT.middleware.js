const jwt = require("jsonwebtoken")
require("dotenv").config()
const secret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(401).send({ message: "Token is missing!" });
  }

  //Token เอาไว้พิสูจน์ตัวตนผู้ใช้ และควบคุมสิทธิ์การเข้าถึง API
  //ใช้กุญแจนี้ตรงกับตัวล็อคประตูที่ออกแบบไว้
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Access Forbidden" });
    }

    req.username = decoded.username; // สมมติว่า token เก็บ username
    req.authorId = decoded.id || decoded._id; // สมมติว่า token เก็บ id
    next();
  });
};

const authJwt = { verifyToken };
module.exports = authJwt;