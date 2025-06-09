"use strict";
const utils_request = require("../utils/request.js");
const loginApi = ({ phone, code }) => {
  return utils_request.http.post("/login", { phone, code });
};
const uploadApi = (filePath) => {
  return utils_request.http.upload("/upload", filePath, "file");
};
const sendSMS = (phone, code) => {
  return utils_request.http.post("/sendSMS", { phone, code });
};
const logOutApi = () => {
  return utils_request.http.post("/logout");
};
exports.logOutApi = logOutApi;
exports.loginApi = loginApi;
exports.sendSMS = sendSMS;
exports.uploadApi = uploadApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/common.js.map
