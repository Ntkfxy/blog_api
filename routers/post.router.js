const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

router.post("/create", postController.createPost);

router.get("/", postController.getAllPost);
router.get("/:id", postController.getByID);
router.get("/author/:id", postController.getByAuthorID);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);
module.exports = router;
