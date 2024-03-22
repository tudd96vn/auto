const mysql = require("mysql2");

const database = {
  async connection() {
    return new Promise((resolve, reject) => {
      const connect = mysql.createConnection({
        host: "10.1.39.93",
        port: 38306,
        user: "root",
        password: "root",
        database: "ecorange",
      });
      connect.connect((err) => {
        if (err) {
          console.log("connect db error");
          reject(err);
        } else {
          console.log("connected db");
          resolve(connect);
        }
      });
    });
  },

  async query(conn, query) {
    //console.log(`start query: ${query}`);
    // simple query
    return new Promise((resolve, reject) => {
      conn.query(query, function (err, results, fields) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
};

module.exports = database;
