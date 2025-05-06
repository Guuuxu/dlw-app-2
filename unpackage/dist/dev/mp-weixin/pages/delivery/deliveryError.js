"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_outbound = require("../../api/outbound.js");
const _sfc_main = {
  __name: "deliveryError",
  setup(__props) {
    const errorType = common_vendor.ref(2);
    const row = common_vendor.ref({});
    const msg = common_vendor.ref("");
    common_vendor.onLoad((option) => {
      common_vendor.index.__f__("log", "at pages/delivery/deliveryError.vue:53", JSON.parse(option.item));
      let data = option;
      row.value = option.item ? JSON.parse(option.item) : {}, common_vendor.index.__f__("log", "at pages/delivery/deliveryError.vue:56", "row.value", row.value);
      msg.value = data.msg;
    });
    const active = common_vendor.ref(1);
    const handleChange = (type) => {
      active.value = type;
    };
    const handleConfirm = async () => {
      if (active.value == 1) {
        await api_outbound.usePacakge({
          outbound: row.value.id,
          detail_no: row.value.detail_no,
          force: true
        });
        common_vendor.index.navigateBack(2);
      } else {
        common_vendor.index.navigateBack(1);
      }
    };
    const back = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const handleBack = () => {
      common_vendor.index.navigateBack({
        delta: 2
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: errorType.value == 1
      }, errorType.value == 1 ? {
        b: common_assets._imports_0$3,
        c: common_vendor.o(handleBack)
      } : common_vendor.e({
        d: msg.value && msg.value.includes("单月循环用量达上限")
      }, msg.value && msg.value.includes("单月循环用量达上限") ? {
        e: common_vendor.t(row.value.detail_no),
        f: active.value == 1 ? 1 : "",
        g: common_vendor.o(($event) => handleChange(1)),
        h: active.value == 2 ? 1 : "",
        i: common_vendor.o(($event) => handleChange(2)),
        j: active.value == 3 ? 1 : "",
        k: common_vendor.o(($event) => handleChange(3)),
        l: common_vendor.o(handleConfirm)
      } : {
        m: common_assets._imports_1$2,
        n: common_vendor.t(msg.value),
        o: common_vendor.t(row.value.detail_no),
        p: common_vendor.o(back)
      }));
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/delivery/deliveryError.js.map
