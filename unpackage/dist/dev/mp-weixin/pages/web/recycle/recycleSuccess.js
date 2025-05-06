"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  __name: "recycleSuccess",
  setup(__props) {
    common_vendor.ref(1);
    const handleBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$4,
        b: common_vendor.o(handleBack)
      };
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/web/recycle/recycleSuccess.js.map
