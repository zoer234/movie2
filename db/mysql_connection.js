const mysql = require("mysql2");

// Connection Pool 를 만든다 Pool이 알아서 , 커넥션 연결을 컨트롤 한다.
console.log(process.env.MYSQL_HOST);
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
//queueLimit: 0 는 디폴트 0임
// await 으로 사용하기 위해, 프라미스로 저장.
const connection = pool.promise();
module.exports = connection;
