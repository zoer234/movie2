const connection = require("../db/mysql_connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//@desc     addComment
//@route    POST /api/v1/comments/addcomment
//@parameters   comment , star_rating , movie_id
exports.addComment = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let comment = req.body.comment;
  let star_rating = req.body.star_rating;
  let movie_id = req.body.movie_id;

  let query = `insert into movie_comment(comment,star_rating,movie_id,user_id) values ("${comment}","${star_rating}",${movie_id},${user_id})`;
  try {
    [result] = await connection.query(query);
    if (!result.affectedRows == 1) {
      res.status(400).json({ success: false });
      return;
    }
    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, e });
  }
};

//@desc     getComment
//@route    get /api/v1/comments?title&offset=0
//@properties   title,email,comment, star_rating, created_at
exports.getComment = async (req, res, next) => {
  let title = req.query.title;
  let offset = req.query.offset;
  let limit = req.query.limit;
  if (limit > 50) {
    res.status(400).json({ success: false });
    return;
  }
  let query = `select m.title,mu.user_email,c.comment,c.star_rating,c.created_at from movie as m join movie_comment as c on m.id = c.movie_id join movie_user as mu on mu.id = c.user_id where m.title = "${title}" limit ${offset},${limit} `;
  try {
    [rows] = await connection.query(query);
    if (rows.length == 0) {
      res.status(400).json({ success: false });
      return;
    }
    res.status(200).json({ success: true, rows });
  } catch (e) {
    res.status(500).json({ success: false, e });
  }
};
//@desc     updateComment&star_rating
//@route    POST /api/v1/comments/update
//@parameters   comment , star_rating , movie_id
exports.update = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let comment = req.body.comment;
  let star_rating = req.body.star_rating;
  let movie_id = req.body.movie_id;

  let query = `update movie_comment set comment = "${comment}", star_rating = ${star_rating} where movie_id = ${movie_id} and user_id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    if (!result.affectedRows == 1) {
      res.status(400).json({ success: false });
      return;
    }
    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, e });
  }
};
//@desc     deleteComment
//@route    DELETE /api/v1/comments/delete
//@parameters  movie_id
exports.deleteComments = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let movie_id = req.body.movie_id;

  let query = `delete from movie_comment where movie_id = ${movie_id} and user_id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    if (!result.affectedRows == 1) {
      res.status(400).json({ success: false });
      return;
    }
    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, e });
  }
};
