const pool = require("../config/db");
module.exports = {
  mUpdateCompany: (data, id) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "UPDATE company SET ? WHERE id = ?",
        [data, id],
        (err, result) => {
          if (!err) {
            resolve(result);
          } else {
            reject(new Error(err));
          }
        }
      );
    });
  },
  mAddCompany: (data) => {
    return new Promise((resolve, reject) => {
      pool.query("INSERT INTO company SET ?", data, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(new Error(err));
        }
      });
    });
  },
  mDetailCompany: (id) => {
    return new Promise((resolve, reject) => {
      pool.query(`SELECT * FROM company WHERE id='${id}'`, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(new Error(err));
        }
      });
    });
  },
};