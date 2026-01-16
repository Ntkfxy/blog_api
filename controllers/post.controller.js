const PostModel = require("../models/Post");


exports.createPost = async (req, res) => {
   console.log("AUTHOR ID:", req.authorId);
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
    const post = await PostModel.find()
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .limit(20);

    if (!post.length) {
      return res.status(404).send({ message: "Post not found" });
    }

    res.send(post);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Something error while retrieving the post",
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
    const post = await PostModel.findById(id)
      .populate("author", ["username"])
      .sort({ createAt: -1 })
      .limit(20);

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    res.send(post);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Something error while retrieving the post",
    });
  }
};

exports.getByAuthorID = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await PostModel.find({ author: id })
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);

    if (!post.length) {
      return res.status(404).send({ message: "Post not found" });
    }

    res.send(post);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Something error while retrieving the post",
    });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId;
  if (!id) {
    return res.status(400).send({
      message: "Post ID is missing",
    });
  }
  try {
    const { title, cover, summary, content } = req.body;
    if (!title && !cover && !summary && !content) {
      return res.status(400).send({ message: "Please provide al fields" });
    }

    const postDoc = await PostModel.findOne({ _id: id, author: authorId });
    if (!postDoc) {
      return res
        .status(400)
        .send({ message: " Post with this author id is not found" });
    }
    if (postDoc.length === 0) {
      return res.status(403).send({
        message:
          "Unauthorize to edit this post, because you are not the author of this post",
      });
    } else {
      // postDoc.title = title;
      // postDoc.cover = cover;
      // postDoc.summary = summary;
      // postDoc.content = content;
      // await postDoc.save();

      const newPost = await PostModel.findOneAndUpdate(
        { author: authorId, _id: id },
        { title, cover, summary, content },
        {
          new: true,
        }
      );
      if (!newPost) {
        return res.status(500).send({ message: "Cannot update this post" });
      }
      res.send({ message: "Post update Successfully!!" });
    }
  } catch (error) {
    res.status(500).send({
      message: error.message || "Something error while retrieving the post",
    });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const authorId = req.authorId;
  if (!id) {
    return res.status(400).send({
      message: "Post ID is missing",
    });
  }

  try {
    const postDoc = await PostModel.findOneAndDelete({
      author: authorId,
      _id: id,
    });
    if (!postDoc) {
      return res.status(500).send({ message: "Cannot delete  this post" });
    }
    res.send({ message: "Post delete Successfully!!" });
  } catch (error) {
    res.status(500).send({ message: error.message || "Failed to delete post" });
  }
};
