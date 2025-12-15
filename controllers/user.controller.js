const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET
const salt = bcrypt.genSaltSync(10);

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({
        message: "Please provide username and password",
      });
    }

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).send({
        message: "Username is already used",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      username,
      password: hashedPassword,
    });

    return res.send({
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Error while registering user",
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username or Password are missing",
      });
    }

    //มีผู้ใช้งานในระบบนี้ไหม
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    //ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    //สร้าง token จะถูกใช้ยืนยันตัวตนแทนการ login ซ้ำทุกครั้ง กำหนดอายุ Token = 24 ชั่วโมง
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    //ส่งผลลัพธ์ไปใให้ผู้ใช้ว่า เข้าสู่ระบบเรียบร้อยร้อยพร้อม token
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while login",
    });
  }
};

