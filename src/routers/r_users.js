const {
  register,
  login,
  logout,
  activation,
  profileMe,
  getAllUser,
  getDetailUser,
  updateUser,
  deleteUser,
} = require("../controllers/c_users");
const {
  addcompany
} = require("../controllers/c_company")
const { uploadfile } = require("../controllers/c_request");
const { authentication, authAdmin } = require("../helpers/middleware/auth");
const singleUploadProject = require("../helpers/middleware/profile");

const express = require("express");
const routers = express.Router();
console.log("route")
routers
  .get("/user/me", authentication, profileMe)
  .post("/register", register)
  .post("/login", login)
  .post("/logout", authentication, logout)
  .post("/company/register", authentication, addcompany)
  .post("/company/uploadFile", authentication, uploadfile)
  // .get("/activate/:token/:email/:position/:access", activation)
  .get("/users", authentication, authAdmin, getAllUser)
  .get("/user/:id", authentication, getDetailUser)
  .patch("/user/:id", authentication, singleUploadProject, updateUser)
  .delete("/user/:id", authentication, authAdmin, deleteUser);

module.exports = routers;
