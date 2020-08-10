const express = require("express");
const router = express.Router();
const auth = require("../middlerwaer/auth");
const {
  addComment,
  getComment,
  update,
  deleteComments,
} = require("../controllers/comment");

router.route("/").get(getComment);
router.route("/addcomment").post(auth, addComment);
router.route("/update").post(auth, update);
router.route("/delete").delete(auth, deleteComments);
module.exports = router;
