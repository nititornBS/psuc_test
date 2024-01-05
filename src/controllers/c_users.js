const {
  mCheckEmail,
  mRegister,
  mCreateActivation,
  mActivation,
  mActivationUser,
  mDeleteActivation,
  mProfileMe,
  mGetAllUser,
  modelTotalUser,
  mDetailUser,
  mUpdateUser,
  mDeleteUser,
} = require("../modules/m_users");
const { custom, success, failed } = require("../helpers/response");
const { envJWTKEY } = require("../helpers/env");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

module.exports = {
  register: async (req, res) => {
    try {
      const body = req.body;
      // Check if email is already registered
      const emailCheck = await mCheckEmail(body.email);

      if (emailCheck.length >= 1) {
        custom(res, 422, "Email has been registered!", {}, null);
      } else {
        // Hash password
        const salt = await bcrypt.genSaltSync(10);
        const password = await bcrypt.hashSync(body.password, salt);

        // Create user data object
        const userData = {
          email: body.email,
          password,
          name: body.name,
          role: body.role,
          company_id: body.company_id,
        };

        // Create token
        const token = jwt.sign(
          { name: body.name, create: new Date() },
          envJWTKEY
        );

        // Register user
        const user = await mRegister(userData);
        console.log({ user });
        const userId = user.insertId;
        console.log(userId);
        // Create activation
        await mCreateActivation(token, userId);

        // Omitting email sending since activation status is set directly
        success(
          res,
          "Registration successful! Activate your account through other means.",
          {},
          null
        );
      }
    } catch (error) {
      failed(res, "Internal Server Error!", error.message);
    }
  },
  // activation: (req, res) => {
  //   const token = req.params.token;
  //   const email = req.params.email;
  //   const position = req.params.position;
  //   const access = req.params.access;
  //   mActivation(token, email)
  //     .then((response) => {
  //       mActivationUser(email, position, access)
  //         .then(() => {
  //           mDeleteActivation(response[0].id)
  //             .then(() => {
  //               success(res, "Activated", {}, null);
  //             })
  //             .catch((error) => {
  //               failed(res, "Internal Server Error!", error.message);
  //             });
  //         })
  //         .catch((error) => {
  //           failed(res, "Internal Server Error!", error.message);
  //         });
  //     })
  //     .catch((error) => {
  //       failed(res, "Internal Server Error!", error.message);
  //     });
  // },
  login: (req, res) => {
    const body = req.body;
    mCheckEmail(body.email)
      .then(async (response) => {
        if (response.length === 1) {
          const hash = await response[0].password;
          const checkPass = await bcrypt.compareSync(body.password, hash);
          if (checkPass) {
            // if (response[0].status === 1) {
            const data = {
              id: response[0].id,
              email: response[0].email,
              access: response[0].access,
            };
            const token = jwt.sign(data, envJWTKEY, { expiresIn: "1d" });
            const expired = new Date();
            expired.setDate(expired.getDate() + 1);
            const newData = {
              token,
              user_id: response[0].id,
            };
            console.log({ newData });
            // update token and expired
            mUpdateUser(newData, response[0].id).then(() => {
              // send response user by id
              mDetailUser(response[0].id)
                .then((response) => {
                  success(res, "Login success!", null, { response, token });
                })
                .catch((error) => {
                  failed(res, "Internal Server Error!", error.message);
                });
            });
            // } else {
            //   custom(
            //     res,
            //     422,
            //     `Your account isn't activated yet! Check your email!`,
            //     {},
            //     null
            //   );
            // }
          } else {
            custom(res, 422, "Your password is wrong!", {}, null);
          }
        } else {
          custom(res, 422, "Email not registered!", {}, null);
        }
      })
      .catch((error) => {
        failed(res, "Internal Server Error!", error.message);
      });
  },
  logout: (req, res) => {
    const id = req.body.id;
    const data = {
      token: null,
      expired: null,
      updated: new Date(),
    };
    mUpdateUser(data, id)
      .then((response) => {
        if (response.affectedRows) {
          success(res, "Logout success!", {}, true);
        } else {
          custom(res, 404, "Id user not found!", null, false);
        }
      })
      .catch((error) => {
        failed(res, "Internal Server Error!", error.message);
      });
  },
  profileMe: (req, res) => {
    const authorization = req.headers.authorization;
    const token = authorization.split(" ");
    mProfileMe(token[1])
      .then((response) => {
        success(res, "Data profile!", null, response);
      })
      .catch((error) => {
        failed(res, "Internal Server Error!", error.message);
      });
  },
  getAllUser: async (req, res) => {
    try {
      // searching
      const filter = req.query.filter ? req.query.filter : "name";
      const keyword = req.query.keyword ? req.query.keyword : "";
      const search = filter
        ? `WHERE ${filter.toString().toLowerCase()} LIKE '%${keyword
            .toString()
            .toLowerCase()}%'`
        : "";
      // sorting
      const sortby = req.query.sortby ? req.query.sortby : "";
      const orderby = req.query.orderby ? req.query.orderby : "asc";
      const sorting = sortby
        ? `ORDER BY ${sortby} ${orderby.toString().toLowerCase()}`
        : "";
      // pagination
      const page = req.query.page ? req.query.page : 1;
      const limit = req.query.limit ? req.query.limit : 10;
      const start = page === 1 ? 0 : (page - 1) * limit;
      const pages = page ? `LIMIT ${start}, ${limit}` : "";
      const totalPage = await modelTotalUser(search);

      mGetAllUser(search, sorting, pages)
        .then((response) => {
          if (response.length > 0) {
            const pagination = {
              page: page,
              limit: limit,
              total: totalPage[0].total,
              totalPage: Math.ceil(totalPage[0].total / limit),
            };
            success(res, "Get all data user", pagination, response);
          } else {
            const pagination = {
              page: 1,
              limit: limit,
              total: 0,
              totalPage: 0,
            };
            custom(res, 404, "Data not found!", pagination, response);
          }
        })
        .catch((error) => {
          failed(res, "Internal server error!", error.message);
        });
    } catch (error) {
      failed(res, "Internal server error!", error.message);
    }
  },
  getDetailUser: (req, res) => {
    const id = req.params.id;
    mDetailUser(id)
      .then((response) => {
        if (response.length > 0) {
          success(res, "Detail user", null, response);
        } else {
          custom(res, 404, "Id user not found!", null, []);
        }
      })
      .catch((error) => {
        failed(res, "Internal Server Error!", error.message);
      });
  },
  updateUser: async (req, res) => {
    const body = req.body;
    body.updated = new Date();
    const id = req.params.id;
    const detail = await mDetailUser(id);
    if (req.file) {
      if (detail[0].image === "defaultuser.png") {
        body.image = req.file.filename;
        mUpdateUser(body, id)
          .then(() => {
            success(res, "Update profile sucess!", {}, null);
          })
          .catch((error) => {
            failed(res, "Internal server error!", null || error.message);
          });
      } else {
        body.image = req.file.filename;
        const path = `./public/profile/${detail[0].image}`;
        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
        mUpdateUser(body, id)
          .then(() => {
            success(res, "Update profile success", {}, null);
          })
          .catch((error) => {
            failed(res, "Internal server error!", null || error.message);
          });
      }
    } else {
      mUpdateUser(body, id)
        .then(() => {
          success(res, "Update success", {}, null);
        })
        .catch((error) => {
          failed(res, "Internal Server Error!", error.message);
        });
    }
  },
  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const callDetail = await mDetailUser(id);
      mDeleteUser(id)
        .then((response) => {
          if (response.affectedRows) {
            // select image profile
            if (callDetail[0].image === "defaultuser.png") {
              success(res, "Delete success!", {}, null);
            } else {
              const locationPath = `./public/profile/${callDetail[0].image}`;
              fs.unlinkSync(locationPath);
              success(res, "Delete success.", {}, null);
            }
          } else {
            custom(res, 404, "Id user not found!", null, null);
          }
        })
        .catch((error) => {
          failed(res, "Internal server error!", error.message);
        });
    } catch (error) {
      failed(res, "Internal server error!", error.message);
    }
  },
};
