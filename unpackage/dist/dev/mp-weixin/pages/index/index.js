"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_common = require("../../api/common.js");
if (!Math) {
  customTabbar();
}
const customTabbar = () => "../../components/custom-tabbar/custom-tabbar.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    var _a;
    const userInfo = common_vendor.ref({});
    userInfo.value = common_vendor.index.getStorageSync("userInfo") ? JSON.parse(common_vendor.index.getStorageSync("userInfo")) : {};
    common_vendor.index.__f__("log", "at pages/index/index.vue:131", "userInfo", userInfo);
    const roleName = common_vendor.index.getStorageSync("ROLE_KEY") || "";
    if (!((_a = userInfo.value) == null ? void 0 : _a.name)) {
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    }
    const webTypeOption = ["管理员", "操作员", "法人"];
    const adminTypeOption = ["管理员", "操作员", "代工厂"];
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定退出登录？",
        async success({ confirm }) {
          if (confirm) {
            await api_common.logOutApi();
            common_vendor.index.setStorageSync("token", "");
            common_vendor.index.setStorageSync("userInfo", "");
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }
        }
      });
    };
    const pageTo = (url) => {
      common_vendor.index.reLaunch({
        url
      });
    };
    const handleUnsubscribe = () => {
      common_vendor.index.showModal({
        title: "注销账号",
        content: "一旦注销，您的账号将无法继续使用？",
        async success({ confirm }) {
          if (confirm) {
            await api_common.deleteUserApi();
            common_vendor.index.setStorageSync("token", "");
            common_vendor.index.setStorageSync("userInfo", "");
            common_vendor.index.reLaunch({
              url: "/pages/login/login"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(roleName) === "admin" ? "迪雷沃包装设计(上海)有限公司" : userInfo.value.company_name),
        b: common_vendor.t(common_vendor.unref(roleName) === "admin" ? adminTypeOption[+userInfo.value.type - 1] : webTypeOption[+userInfo.value.type - 1]),
        c: common_vendor.t(userInfo.value.name),
        d: common_assets._imports_0$1,
        e: common_assets._imports_1,
        f: common_vendor.o(handleLogout),
        g: common_assets._imports_2,
        h: common_assets._imports_0,
        i: common_vendor.o(($event) => pageTo("/pages/auth/index")),
        j: common_assets._imports_4,
        k: common_assets._imports_0,
        l: common_vendor.o(($event) => pageTo("/pages/delivery/index")),
        m: userInfo.value.type !== 3 && common_vendor.unref(roleName) === "admin" || common_vendor.unref(roleName) === "web"
      }, userInfo.value.type !== 3 && common_vendor.unref(roleName) === "admin" || common_vendor.unref(roleName) === "web" ? {
        n: common_assets._imports_5,
        o: common_assets._imports_0,
        p: common_vendor.o(($event) => pageTo("/pages/recycle/detailList"))
      } : {}, {
        q: userInfo.value.type !== 3 && common_vendor.unref(roleName) === "admin" || common_vendor.unref(roleName) === "web"
      }, userInfo.value.type !== 3 && common_vendor.unref(roleName) === "admin" || common_vendor.unref(roleName) === "web" ? {
        r: common_assets._imports_6,
        s: common_assets._imports_0,
        t: common_vendor.o(($event) => pageTo("/pages/report/index"))
      } : {}, {
        v: common_vendor.o(handleUnsubscribe)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
