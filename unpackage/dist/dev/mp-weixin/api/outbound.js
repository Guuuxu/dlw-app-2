"use strict";
const utils_request = require("../utils/request.js");
const getOutboundList = ({ page, per_page }) => {
  return utils_request.http.get("/bound/outbound/mobile", { page, per_page });
};
const getOutboundDetail = (id) => {
  return utils_request.http.get(`/bound/outbound/${id}`);
};
const scanOutbound = ({ outbound, detail_no }) => {
  return utils_request.http.post(`/bound/outbound/${outbound}/scan/mobile`, { detail_no });
};
const usePacakge = ({ outbound, detail_no, force }) => {
  return utils_request.http.post(`/bound/outbound/${outbound}/scan`, { detail_no, force });
};
exports.getOutboundDetail = getOutboundDetail;
exports.getOutboundList = getOutboundList;
exports.scanOutbound = scanOutbound;
exports.usePacakge = usePacakge;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/outbound.js.map
