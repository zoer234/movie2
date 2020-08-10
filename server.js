const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: `./config/config.env` });
// 파일 처리를 위한 라이브러리 임포트
const fileupload = require("express-fileupload");
const path = require("path");

// router
const movie = require("./routes/movie.js");
const user = require("./routes/users");
const comment = require("./routes/comment");
const reservation = require("./routes/reservation");

const app = express();
app.use(express.json());
app.use(fileupload());
// 이미지를 불러올 수 있도록 static 경로 설정
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/movies", movie);
app.use("/api/v1/users", user);
app.use("/api/v1/comments", comment);
app.use("/api/v1/reservations", reservation);
const PORT = process.env.PORT || 5900;

app.listen(PORT, console.log("서버가동 !"));
