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
  try {
    const posts = (await PostModel.findById(id).populate("author", ["username"]))
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

exports.getByAuthorID = async (req, res) => { 
  const { id } = req.params;
  try {
    const posts = (await PostModel.findById({author: id}).populate("author", ["username"]))
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
exports.updatePost = async (req, res) => {try {
    const { id } = req.params;
    const posts = await PostModel.findById(id);
    if (!posts)
      return res.status(404).json({ message: "Post not found" });

    if (req.body.name && req.body.name !== posts.name) {
      const duplicate = await PostModel.findOne({
        where: { name: req.body.name },
      });
      if (duplicate)
        return res
          .status(400)
          .send({ message: "Posts is already existed" });
    }

    await posts.update(req.body);
    res.status(200).json({ message: "Post updated successfully", posts });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update post" });
  }
};
exports.deletePost = async (req, res) => { try {
    const { id } = req.params;
    const posts = await PostModel.findById(id);
    if (!posts) return res.status(404).json({ error: "Post not found" });

    await posts.destroy();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete post" });
  }
};
