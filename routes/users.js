const express = require("express");
const router = express.Router();
const auth = require("../middlerwaer/auth");
const {
  signUp,
  signIn,
  getMyInfo,
  resetPassword,
  forgotPassword,
  deleteUser,
  allSignout,
  signOut,

  deleteFavorite,
  addFavorite,
  getFavoriteMovie,
  userPhotoUpload,
} = require("../controllers/users");

router.route("/signup").post(signUp);
router.route("/signin").post(signIn);
router.route("/myinfo").get(auth, getMyInfo);
router.route("/resetpassword").post(auth, resetPassword);
router.route("/forgotpassword").post(auth, forgotPassword);
router.route("/deleteuser").delete(auth, deleteUser);
router.route("/allsignout").delete(auth, allSignout);
router.route("/signout").delete(auth, signOut);
router.route("/favorite").get(auth, getFavoriteMovie);
router.route("/favorite").post(auth, addFavorite);
router.route("/favorite").delete(auth, deleteFavorite);
router.route("/me/photo").put(auth, userPhotoUpload);
module.exports = router;
