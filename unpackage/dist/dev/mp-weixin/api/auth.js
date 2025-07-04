"use strict";
const utils_request = require("../utils/request.js");
const getBoundList = ({
  page,
  per_page,
  type_name
}) => {
  return utils_request.http.get("/bound/inbound", {
    page,
    per_page,
    type_name
  });
};
const getScanResult = (inbound, page) => {
  return utils_request.http.get(`/bound/inbound/${inbound}/result`, page);
};
const scanAdmin = ({
  id,
  type,
  detail_no
}) => {
  return utils_request.http.post("/bound/inbound/scan", {
    id,
    type,
    detail_no
  });
};
const authConfirm = (outbound) => {
  return utils_request.http.post(`/bound/inbound/${outbound}/confirm`, {});
};
const scanCustomer = ({
  outbound,
  detail_no
}) => {
  return utils_request.http.post(`/bound/inbound/${outbound}/scan`, {
    detail_no
  });
};
const scanRecycle = ({
  detail_no
}) => {
  return utils_request.http.post(`/bound/inbound/recycle`, {
    detail_no
  });
};
exports.authConfirm = authConfirm;
exports.getBoundList = getBoundList;
exports.getScanResult = getScanResult;
exports.scanAdmin = scanAdmin;
exports.scanCustomer = scanCustomer;
exports.scanRecycle = scanRecycle;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/auth.js.map
