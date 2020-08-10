const connection = require("../db/mysql_connection");

// @desc 영화 데이터 불러오기
// @url  /api/v1/movies?offset=0&limit=
// @request   offset
// @response  success nextOffset result
exports.getMovies = async (req, res, next) => {
  console.log("getMovies");
  let offset = req.query.offset;
  let limit = req.query.limit;
  if (limit > 50 || !offset || !limit) {
    res.status(400).json({ success: false });
    return;
  }

  try {
    let query = `select m.title,m.genre,m.year,m.attendance,count(c.id) as "comment count",ifnull(round(avg(c.star_rating),1),0) as rating from movie as m left join movie_comment as c on m.id = c.movie_id group by m.id limit ${offset},${limit};`;
    [rows] = await connection.query(query);
    let next = rows.length;
    res.status(200).json({ success: true, nextOffset: next, result: rows });
  } catch (e) {
    res.status(500).json({ e });
  }
};

// @desc   영화명 검색해서 가져오기
// @url    /api/v1/movies/search?offset=0&title
// @request   offset,title
// @response  success nextOffset result
exports.getMovieSearch = async (req, res, next) => {
  let offset = req.query.offset;
  let title = req.query.title;
  let limit = req.query.limit;
  if (limit > 50 || !offset || !limit || !title) {
    res.status(400).json({ success: false });
    return;
  }
  try {
    let query = `select m.title,m.genre,m.year,m.attendance,count(c.id) as "comment count",ifnull(round(avg(c.star_rating),1),0) as rating from movie as m left join movie_comment as c on m.id = c.movie_id where m.title  like "%${title}%" group by m.id  limit ${offset},${limit}`;
    [rows] = await connection.query(query);
    let next = rows.length;
    res.status(200).json({ success: true, nextOffset: next, result: rows });
  } catch (e) {
    res.status(500).json({ e });
  }
};
// @desc    연도 내림차순 정렬해서 가져오기
// @url     /api/v1/movies/year?offset=0
// @request   offset
// @response  success nextOffset result
exports.getMoviesYear = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  if (limit > 50 || !offset || !limit) {
    res.status(400).json({ success: false });
    return;
  }
  try {
    let query = `select m.title,m.genre,m.year,m.attendance,count(c.id) as "comment count",ifnull(round(avg(c.star_rating),1),0) as rating from movie as m left join movie_comment as c on m.id = c.movie_id group by m.id order by m.year limit ${offset},${limit}`;
    [rows] = await connection.query(query);
    let next = rows.length;
    res.status(200).json({ success: true, nextOffset: next, result: rows });
  } catch (e) {
    res.status(500).json({ e });
  }
};
// @desc    관객수 내림차순 정렬해서 가져오기
// @url     /api/v1/movies/attendance?offset=0
// @request   offset
// @response  success nextOffset result
exports.getMoviesAttendance = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  if (limit > 50 || !offset || !limit) {
    res.status(400).json({ success: false });
    return;
  }
  try {
    let query = `select m.title,m.genre,m.year,m.attendance,count(c.id) as "comment count",ifnull(round(avg(c.star_rating),1),0) as rating from movie as m left join movie_comment as c on m.id = c.movie_id group by m.id order by m.attendance desc limit ${offset},${limit}`;

    [rows] = await connection.query(query);
    let next = rows.length;
    res.status(200).json({ success: true, nextOffset: next, result: rows });
  } catch (e) {
    res.status(500).json({ e });
  }
};
