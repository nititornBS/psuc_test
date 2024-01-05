const pool = require("../config/db");
module.exports = {
  mCheckEmail: (email) => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT * FROM users WHERE email='${email}'`,
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
  mRegister: (data) => {
    return new Promise((resolve, reject) => {
      pool.query("INSERT INTO users SET ?", data, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(new Error(err));
        }
      });
    });
  },
 
  mCreateActivation: (token, userId) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "INSERT INTO activation (token, user_id) VALUES (? , ?)",
        [token, userId],
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
  mActivation: (token, userId) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "SELECT id FROM activation WHERE token = ? AND userId = ?",
        [token, userId],
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
  mActivationUser: (email, access) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "UPDATE users SET , status = ?, access = ? WHERE email = ?",
        [1, access, email],
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
  mDeleteActivation: (id) => {
    return new Promise((resolve, reject) => {
      pool.query(`DELETE FROM activation WHERE id='${id}'`, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(new Error(err));
        }
      });
    });
  },
  mProfileMe: (token) => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT id, name, email, company_id, token, expired, image, status, access, created, updated FROM users WHERE token='${token}'`,
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
  mGetAllUser: (search, sorting, pages) => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT * FROM users ${search} ${sorting} ${pages}`,
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
  modelTotalUser: (search) => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT COUNT(*) as total FROM users ${search}`,
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
  mDetailUser: (id) => {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT* FROM users WHERE id='${id}'`,
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
  
  mUpdateUser: (data, id) => {
    return new Promise((resolve, reject) => {
      pool.query(
        "UPDATE activation SET ? WHERE user_id = ?",
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
  mDeleteUser: (id) => {
    return new Promise((resolve, reject) => {
      pool.query(`DELETE FROM users WHERE id='${id}'`, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(new Error(err));
        }
      });
    });
  },
};
