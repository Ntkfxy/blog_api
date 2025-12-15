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
  //2.username is existed?
  //3. compare password
  //4. generate token

  try {
    //1.check username & password
    //การสลายโครงสร้าง
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({
        message: "Username or Password are missing!!, please provide",
      });
    }

    //มีผู้ใช้งานในระบบนี้ไหม
    const userDoc = await UserModel.findOne({ username });
    if (!userDoc) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    //ตรวจสอบรหัสผ่าน
    const isPasswordMatched = await bcrypt.compare(password, userDoc.password);

    //status 401
    if (!isPasswordMatched) {
      return res.status(401).send({
        message: "Invalid credentials",
      });
    }

    //สร้าง token
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) {
        res
          .status(500)
          .send({ message: "Internal Serve Error: Authentication failed!" });
      }
      res.send({ message: "Logged in successful", accessToken: token });
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Error while registering user",
    });
  }
};
