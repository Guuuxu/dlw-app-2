"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_auth = require("../../../api/auth.js");
const _sfc_main = {
  __name: "detailList",
  setup(__props) {
    const list = common_vendor.ref([]);
    const pageTo = () => {
      common_vendor.index.navigateTo({
        url: "/pages/recycle/recycleSuccess"
      });
    };
    const handleScan = async () => {
      common_vendor.index.scanCode({
        success: async (res) => {
          if (role.value === "admin") {
            try {
              const resScan = await api_auth.scanAdmin({
                id: row.value.id,
                type: 3,
                detail_no: res.result
              });
              common_vendor.index.showToast({
                title: "已回收",
                icon: "none"
              });
            } catch (error) {
              list.value.unshift({
                status: 7,
                detail_no: res.result
              });
            }
          } else {
            try {
              await api_auth.scanRecycle({
                detail_no: res.result
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
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7f707b02"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/web/recycle/detailList.js.map
