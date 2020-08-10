const connection = require("../db/mysql_connection");
const jwt = require("jsonwebtoken");
const auth = async (req, res, next) => {
  let token = req.header("Authorization").replace("Bearer ", "");
  let user_id;
  try {
    let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    user_id = decoded.user_id;
    console.log(user_id);
  } catch (e) {
    res.status(401).json({ error: "잘못된 인증키 입니다." });
    return;
  }

  try {
    let query = `select * from movie_token where user_id=${user_id} and token = "${token}"`;
    [rows] = await connection.query(query);
    console.log(rows[0]);
    let movie_token = rows[0];
    req.movie_token = movie_token;
    next();
  } catch (e) {
    res.status(401).json({ error: "인증 먼저 하십시오" });
    return;
  }
};

module.exports = auth;
