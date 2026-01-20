const PostModel = require("../models/Post");


exports.createPost = async (req, res) => {
   
  if (!req.file) {
    return res.status(400).json({ message: " Images is required" });
  }

  //ดึง data ข้อมูลมา
  const { title, summary, content } = req.body;
  const authorId = req.authorId;

  if (!title || !summary || !content) {
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

    const postDoc = await PostModel.create({
      title,
      summary,
      content,
      cover: req.file.supabaseUrl,
      author: authorId,
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
    const posts = await PostModel.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์",
    });
  }
};


exports.getByID = async (req, res) => {
  // ต้นทางที่มาสถานะเป็นอะไรถึงจะระบุ array กับ object
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({
      message: "Post ID is missing",
    });
  }

  try {
    const posts = await PostModel.findById(id)
      .populate("author", ["username"])
      // .sort({ createAt: -1 })
      // .limit(20);

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

exports.getByAuthorId = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({
      message: "Author id is missing",
    });
  }
  try {
    const posts = await PostModel.find({ author: id })
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);
    if (!posts) {
      return res.status(404).send({
        message: "Post not found",
      });
    }
    res.send(posts);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some errors occurred while registering a new user",
    });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId;

  if (!id) {
    return res.status(400).send({
      message: "Post Id is missing",
    });
  }

  const { title, summary, content, cover } = req.body;
  if (!title || !summary || !content || !cover) {
    return res.status(400).send({
      message: "Please provide all fields",
    });
  }

  try {
    const postDoc = await PostModel.findOne({
      _id: id,
      author: authorId,
    });

    if (!postDoc) {
      return res.status(403).send({
        message: "คุณไม่มีสิทธิ์แก้ไขโพสต์นี้ หรือไม่พบโพสต์",
      });
    }

    const newPost = await PostModel.findOneAndUpdate(
      { _id: id, author: authorId },
      { title, summary, content, cover },
      { new: true }
    );

    res.status(200).send({
      message: "Post updated successfully",
      data: newPost,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "เกิดข้อผิดพลาดในการแก้ไขโพสต์",
    });
  }
};


exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId;

  if (!id) {
    return res.status(400).send({
      message: "Post Id is missing",
    });
  }
  try {
    const postDoc = await PostModel.findOneAndDelete({
      author: authorId,
      _id: id,
    });
    if (!postDoc) {
      return res.status(404).send({ message: "Cannot delete this post" });
    }
    res.send({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).send({
      message:
        error.message || "Some errors occurred while registering a new user",
    });
  }
};
