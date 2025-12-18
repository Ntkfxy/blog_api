const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const authJwt = require("../middlewares/authJWT.middleware");

router.post("/create", authJwt.verifyToken, postController.createPost);

router.get("/", postController.getAllPost);
router.get("/:id", postController.getByID);
router.get("/author/:id", postController.getByAuthorID);
router.put("/:id", authJwt.verifyToken, postController.updatePost);
router.delete("/:id", authJwt.verifyToken, postController.deletePost);
module.exports = router;
