const express = require("express");
const router = express.Router();
const auth = require("../middlerwaer/auth");

const {
  reservation,
  deleteReservation,
  getMyReservation,
  searchReservation,
} = require("../controllers/reservation");

router.route("/").post(auth, reservation).get(auth, getMyReservation);
router.route("/delete").delete(auth, deleteReservation);
router.route("/search").get(searchReservation);
module.exports = router;
