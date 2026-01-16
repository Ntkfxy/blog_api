const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const authJwt = require("../middlewares/authJWT.middleware");
const { upload, uploadToFirebase } = require("../middlewares/file.middleware");

console.log("🔥 POST ROUTER FILE LOADED 🔥");

// CREATE
router.post(
  "/create",
  upload,
  uploadToFirebase,
  authJwt.verifyToken,
  postController.createPost
);

// READ
router.get("/author/:id", postController.getByAuthorID); // ✅ ต้องอยู่ก่อน
router.get("/", postController.getAllPost);              // GET /api/v1/post
router.get("/:id", postController.getByID);              // GET /api/v1/post/:id

// UPDATE
router.put("/:id", authJwt.verifyToken, postController.updatePost);

// DELETE
router.delete("/:id", authJwt.verifyToken, postController.deletePost);

module.exports = router;
