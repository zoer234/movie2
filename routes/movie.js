const express = require("express");
const router = express.Router();

const {
  getMovies,
  getMovieSearch,
  getMoviesYear,
  getMoviesAttendance,
} = require("../controllers/movie");

router.route("/").get(getMovies);
router.route("/search").get(getMovieSearch);
router.route("/year").get(getMoviesYear);
router.route("/attendance").get(getMoviesAttendance);
module.exports = router;
