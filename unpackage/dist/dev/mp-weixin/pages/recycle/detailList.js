"use strict";
const common_vendor = require("../../common/vendor.js");
const api_auth = require("../../api/auth.js");
if (!Math) {
  (Empty + customTabbar)();
}
const Empty = () => "../../components/empty/empty.js";
const customTabbar = () => "../../components/custom-tabbar/custom-tabbar.js";
const _sfc_main = {
  __name: "detailList",
  setup(__props) {
    const list = common_vendor.ref([]);
    const role = common_vendor.ref("");
    common_vendor.onShow(() => {
      role.value = common_vendor.index.getStorageSync("ROLE_KEY");
    });
    const pageTo = () => {
      common_vendor.index.navigateTo({
        url: "/pages/recycle/recycleSuccess"
      });
    };
    const handleScan = async () => {
      common_vendor.index.scanCode({
        success: async (res) => {
          common_vendor.index.__f__("log", "at pages/recycle/detailList.vue:62", "=====scanCode-success", JSON.stringify(res));
          common_vendor.index.__f__("log", "at pages/recycle/detailList.vue:63", "role.value", role.value);
          if (role.value === "admin") {
            try {
              const resScan = await api_auth.scanAdmin({
                type: 3,
                detail_no: res.result
              });
              common_vendor.index.showToast({
                title: "回收成功",
                icon: "none"
              });
              list.value.unshift({
                msg: "回收成功",
                detail_no: res.result
              });
            } catch ({ data }) {
              list.value.unshift({
                status: 7,
                msg: data.msg,
                detail_no: res.result
              });
            }
          } else {
            try {
              const response = await api_auth.scanRecycle({
                detail_no: res.result
              });
              common_vendor.index.showToast({
                title: "回收成功 ",
                icon: "none"
              });
              list.value.unshift({
                msg: "回收成功",
                detail_no: res.result
              });
            } catch ({ data }) {
              list.value.unshift({
                msg: data.msg,
                detail_no: res.result
              });
            }
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/recycle/detailList.vue:117", "fail");
        }
      });
    };
    const handleFinish = () => {
      common_vendor.index.switchTab({
        url: "/pages/index/index"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: list.value.length
      }, list.value.length ? {
        b: common_vendor.f(list.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.detail_no),
            b: common_vendor.t(item.msg),
            c: index,
            d: common_vendor.o(($event) => pageTo(), index)
          };
        })
      } : {}, {
        c: common_vendor.o(handleScan),
        d: common_vendor.o(handleFinish)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0a052cc1"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recycle/detailList.js.map
