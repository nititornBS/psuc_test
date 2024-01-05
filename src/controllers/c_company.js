const {
  mAddCompany,
  mDetailCompany,
  mUpdateCompany,
} = require("../modules/m_company");
const { custom, success, failed } = require("../helpers/response");
const { envJWTKEY } = require("../helpers/env");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
module.exports = {
  UpdateCompany: (req, res) => {
    try {
      const body = req.body;
      const companyId = body.id;
      const companyData = {
        company_name: body.company_name,
        wallet_address: body.wallet_address,
      };
      mUpdateCompany(companyData, companyId);
      success(res, "update company id: " + companyId + "successful!", {}, null);
    } catch (error) {}
  },
  addcompany: async (req, res) => {
    try {
      const body = req.body;
      const companyData = {
        company_name: body.company_name,
        wallet_address: body.wallet_address,
      };
      const company = await mAddCompany(companyData);
      const companyID = company.insertId;
      await mDetailCompany(companyID)
        .then((response) => {
          success(res, "add company success!", null, response);
        })
        .catch((error) => {
          failed(res, "Internal Server Error!", error.message);
        });
    } catch (error) {
      failed(res, "Internal Server Error!", error.message);
    }
  },
};
