const connection = require("../db/mysql_connection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

// @desc    회원가입
// @route POST /api/v1/users/signup
// @parameters user_email,user_passwd,
exports.signUp = async (req, res, next) => {
  let user_email = req.body.user_email;
  let user_passwd = req.body.user_passwd;
  let hashedPasswd = await bcrypt.hash(user_passwd, 8);

  let conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    let query = `insert into movie_user(user_email,user_passwd) values("${user_email}","${hashedPasswd}")`;
    [rows] = await conn.query(query);
    let user_id = rows.insertId;
    console.log(user_id);
    let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
    query = `insert into movie_token(token,user_id) values("${token}",${user_id})`;
    [result] = await conn.query(query);
    await conn.commit();
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false });
  } finally {
    conn.release();
  }
};

// @desc    sign in
// @route POST /api/v1/users/signin
// @parameters user_email,user_passwd,
exports.signIn = async (req, res, next) => {
  let user_email = req.body.user_email;
  let user_passwd = req.body.user_passwd;

  let con = await connection.getConnection();

  try {
    await con.beginTransaction();

    let query = `select * from movie_user where user_email = "${user_email}"`;

    [rows] = await con.query(query);

    let isMatch = await bcrypt.compare(user_passwd, rows[0].user_passwd);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "!" });
      return;
    }

    let user_id = rows[0].id;

    let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
    query = `insert into movie_token(token,user_id) values("${token}",${user_id})`;
    [result] = await con.query(query);
    await con.commit();
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    console.log("2");
    await con.rollback();
    res.status(500).json({ success: false, e });
  } finally {
    console.log("1");
    con.release();
  }
};

// @desc 내정보 가져오기
// @route get /api/v1/users/myinfo
exports.getMyInfo = async (req, res, next) => {
  console.log("내정보 가져오는 API", req.user);
  delete req.movie_token.token;
  res.status(200).json({ success: true, result: req.movie_token });
};

// @desc   sign out   api : DB 에서 해당 유저의 현재 토큰값을 삭제
// @route  POST /api/v1/users/singout
// @parameter  no
exports.signOut = async (req, res, next) => {
  // 토큰테이블에서, 현재 이 헤더에 있는 토큰으로, 삭제한다.
  let token = req.movie_token.token;
  let user_id = req.movie_token.user_id;

  let query = `delete from movie_token where user_id = ${user_id} and token = "${token}"`;

  try {
    [result] = await connection.query(query);
    if (result.affectedRows == 1) {
      res.status(200).json({ success: true });
      return;
    } else {
      res.status(400).json({ success: false });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 안드로이드 사용하고, 아이폰도 사용하고, 집 컴도 사용.
// 이 서비스를 각각의 디바이스 마다 다 로그인하여 사용 중이였다.
// 전체 디바이스 전부 다 로그아웃을 시키게 하는 API
// @desc   전체 로그아웃
// @route  DELETE /api/v1/users/logout/all
// @parameter  no
exports.allSignout = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let query = `delete from movie_token where user_id = ${user_id}`;

  try {
    [rows] = await connection.query(query);
    if (result.affectedRows == 1) {
      res.status(200).json({ success: true });
      return;
    } else {
      res.status(400).json({ success: false });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc   회원 탈퇴
// @route   DELETE  /api/v1/users/delete
// @body    password
exports.deleteUser = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let password = req.body.password;
  let query2 = `select * from movie_user where id = ${user_id}`;
  try {
    [rows] = await connection.query(query2);
    if (!bcrypt.compare(password, rows[0].password)) {
      res.status(400).json({ success: false, message: 1 });
      return;
    }
  } catch (e) {
    res.status(400).json({ success: false, e, message: 2 });
    return;
  }

  let query = `delete from movie_token where user_id = ${user_id}`;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    // 첫번째 테이블에서 정보 삭제
    [result] = await conn.query(query);
    // 두번째 테이블에서 정보 삭제
    query = `delete from movie_user where id = ${user_id}`;
    [result] = await conn.query(query);

    await conn.commit();
    res.status(200).json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  } finally {
    conn.release();
  }

  // try {
  //   query = `delete from user where id = ${user_id}`;
  //   [result] = await connection.query(query);
  //   res.status(200).json({ success: true });
  // } catch (e) {
  //   res.status(400).json({ success: false, e, message: 3 });
  // }
};

// 유저가 패스워드를 분실!
// 1. 클라언트가 패스워드 분실했다고 서버한테 요청
// 서버가 패스워드를 변경할수 있는 url을 클라이언트한테 보내준다.
// (경로에 암호화된 문자열을 보내줍니다. 토큰역활)

// @desc   패스워드 분실
// @route  POST  /api/v1/users/forgotpasswd
exports.forgotPassword = async (req, res, next) => {
  let movie_token = req.movie_token;
  // 암호화된 문자열 만드는 방법
  // const resetToken = crypto.randomBytes(20).toString("hex");
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswdToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 유저 테이블에, reset_password_token 컬럼에 저장
  let query = `update movie_user set reset_password_token = "${resetPasswdToken}" where id =${user.user_id}`;

  try {
    [reslut] = await connection.query(query);
    movie_token.reset_password_token = resetPasswdToken;
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 2. 클라이언트는 해당 암호화된 주소를 받아서, 새로운 비밀번호를 함깨
// 서버로 보내준다
// 서버는, 이주소가 진짜 유효안지 확인해서, 새로운 비밀번호로 셋팅

// @desc  리셋 패스워드 토큰을, 경로로 만들어서, 바꿀 비번과 함께 요청
//        비번 초기화(reset password api)
// @route Post /api/v1/users/resetPassword/:resetPasswordToken
// @req   password
exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = req.params.resetPasswordToken;
  const user_id = req.movie_token.user_id;

  let query = `select * from movie_user where id = ${user_id}`;
  try {
    [rows] = await connection.query(query);
    savedResetPasswordToken = rows[0].reset_password_token;
    if (!savedResetPasswordToken === resetPasswordToken) {
      res.status(400).json({ success: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }

  let password = req.body.password;
  let hashedPassword = await bcrypt.hash(password, 8);
  query = `update movie_user set password = "${hashedPassword}",reset_password_token ="" where id = ${user_id}`;
  delete req.movie_token.reset_password_token;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc  좋아하는 영화 limit25
// @route GET /api/v1/users/favorite?offset=0&limit = 25
// @properties title,genre,attendance,year

exports.getFavoriteMovie = async (req, res, next) => {
  console.log(req.movie_token);
  let user_id = req.movie_token.user_id;
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select m.id,m.title,m.genre,m.attendance,m.year from favorite_movie as f join movie as m on f.movie_id = m.id where f.user_id = ${user_id} limit ${offset},${limit}`;

  try {
    [result] = await connection.query(query);
    delete result.user_passwd;
    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, e });
  }
};
// @desc 즐겨찾기 삭제
// @route POST /api/v1/users/favorite
exports.deleteFavorite = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let movie_id = req.body.movieId;
  let query = `delete from favorite_movie where user_id = ${user_id} and movie_id = ${movie_id}`;
  try {
    [result] = await connection.query(query);
    if (!result.affectedRows == 1) {
      res.status(400).json({ success: false, e });
      return;
    }
    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, e });
  }
};
// @desc 즐겨찾기 추가
// @route DELTE /api/v1/users/favorite
exports.addFavorite = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  let movie_id = req.body.movieId;
  console.log(user_id, movie_id);

  // favorite_movie movie 유니크 설정
  // let query = `select * from favorite_movie where user_id = ${user_id} and movie_id = ${movie_id}`;
  // try {
  //   [rows] = await connection.query(query);
  //   if (rows.length != 0) {
  //     res.status(401).json({ success: false });
  //     return;
  //   }
  // } catch (e) {
  //   res.status(500).json({ success: false, e });
  //   return;
  // }

  query = `insert into favorite_movie(user_id,movie_id) values(${user_id},${movie_id})`;
  try {
    [result] = await connection.query(query);
    if (!result.affectedRows == 1) {
      res.status(400).json({ success: false, e });
      return;
    }
    res.status(200).json({ success: true, result });
  } catch (e) {
    if (e.error == 1062) {
      res.status(500).json({ message: "이미 즐겨찾기에 추가 되었습니다." });
    } else {
      res.status(500).json({ success: false, e });
    }
  }
};

//@desc     유저의 프로필 사진 설정하는 API
//@route    PUT /api/v1/users/me/photo
//@request  photo
//@response success

// 클라이언트가 사진을 보낸다. => 서버가 이 사진을 받는다.=>
// 서버가 이사진을 디렉토리에 저장한다. => 이 사진의 파일명을 DB에 저장한다.

exports.userPhotoUpload = async (req, res, next) => {
  let user_id = req.movie_token.user_id;
  if (!user_id || !req.files) {
    res.status(400).json();
    return;
  }
  console.log(req.files);

  const photo = req.files.photo;
  // 지금 받은 파일이, 이미지 파일인지 체크
  if (photo.mimetype.startsWith("image") == false) {
    res.status(400).json({ message: "이미지 파일이 아닙니다." });
    return;
  }
  // 크기 체크
  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ message: "파일크기가 정해진것보다 큽니다." });
    return;
  }

  // 파일명 변경법    path 이용
  //  parse(photo.name).ext = 포토의 이름을 지우고 확장자만 남겨라
  photo.name = `photo_${user_id}${path.parse(photo.name).ext}`;
  console.log(photo.name);

  //  지정할 경로 셋팅 ./public/upload/photo_12.jpg
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;
  // 파일을 우리가 지정한 경로에 저장
  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
  // db에 이파일이름을 업데이트 한다.
  let query = `update movie_user set photo_url = "${photo.name}" where id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, e });
  }
};
