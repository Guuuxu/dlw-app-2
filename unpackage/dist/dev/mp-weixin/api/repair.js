"use strict";
const utils_request = require("../utils/request.js");
const scanRepair = (detail_no) => {
  return utils_request.http.post("/repair/scan", { detail_no });
};
const updateRepair = ({
  model_detail_id,
  broken_reason,
  reason,
  main_img,
  first_img,
  second_img
}) => {
  return utils_request.http.post(`/repair/store`, {
    model_detail_id,
    broken_reason,
    reason,
    main_img,
    first_img,
    second_img
  });
};
exports.scanRepair = scanRepair;
exports.updateRepair = updateRepair;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/repair.js.map
