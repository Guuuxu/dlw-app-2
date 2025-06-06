"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "authError",
  setup(__props) {
    const errorType = common_vendor.ref(1);
    common_vendor.onLoad((option) => {
      common_vendor.index.__f__("log", "at pages/auth/authError.vue:57", option);
      let data = option;
      errorType.value = data.errorType;
    });
    const navigatorBack = () => {
      if (errorType.value == 3) {
        common_vendor.index.navigateBack({
          delta: 3
        });
        return;
      }
      if (errorType.value == 0) {
        common_vendor.index.navigateBack({
          delta: 2
        });
        return;
      }
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: errorType.value == 0
      }, errorType.value == 0 ? {
        b: common_assets._imports_0$5
      } : errorType.value == 1 ? {
        d: common_assets._imports_1$3
      } : {}, {
        c: errorType.value == 1,
        e: errorType.value == 2
      }, errorType.value == 2 ? {
        f: common_assets._imports_2$1
      } : {}, {
        g: errorType.value == 3
      }, errorType.value == 3 ? {
        h: common_assets._imports_3
      } : {}, {
        i: common_vendor.o(($event) => navigatorBack())
      });
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/authError.js.map
