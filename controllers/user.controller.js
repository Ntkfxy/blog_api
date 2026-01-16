const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();

const secret = process.env.JWT_SECRET;

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
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
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
      return res.status(400).send({
        message: "Username or Password are missing",
      });
    }

    const userDoc = await UserModel.findOne({ username });
    if (!userDoc) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      userDoc.password
    );

    if (!isPasswordMatched) {
      return res.status(401).send({
        message: "Invalid credentials",
      });
    }

    // ✅ สร้าง token
    const token = jwt.sign(
      { id: userDoc._id, username: userDoc.username },
      secret,
      { expiresIn: "1d" }
    );

    // ✅ ส่งข้อมูลให้ frontend ครบ
    return res.status(200).send({
      message: "Login successful",
      id: userDoc._id,
      username: userDoc.username,
      accessToken: token,
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Login error",
    });
  }
};
