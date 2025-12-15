const PostModel = require("../models/Post");
const UserModel = require("../models/User");

exports.createPost = async (req, res) => {
  const { title, cover, author: username, createdAt, summary } = req.body;

  if (!title || !cover || !username || !createdAt || !summary) {
    return res.status(400).send({
      message: "Please provide all fields",
    });
  }

  try {
    // ตรวจสอบ Post ซ้ำ
    const existingPost = await PostModel.findOne({ title });
    if (existingPost) {
      return res.status(400).send({ message: "Post title already used" });
    }

    // หา user จาก username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: "Author not found" });
    }

    // สร้าง Post
    const postDoc = await PostModel.create({
      title,
      cover,
      author: user._id,
      createdAt,
      summary,
    });
    if (!postDoc) {
      return res.status(404).send({ message: "Cannot create a new post" });
    }

    res.send({
      message: "Post created successfully",
      data: postDoc,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Something error while creating the post",
    });
  }
};

exports.getAllPost = async (req, res) => {
  try {
    const posts = (await PostModel.find().populate("author", ["username"]))
      .sort({ createdAt: -1 })
      .limit(20);
    if (!posts) {
      return res.status(404).send({ message: "Post not found" });
    }
    res.send(posts);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Something error while retrieving the post",
    });
  }
};

exports.getByID = async (req, res) => {
  const { id } = req.params;
};
exports.getByAuthorID = async (req, res) => {};
exports.updatePost = async (req, res) => {};
exports.deletePost = async (req, res) => {};
