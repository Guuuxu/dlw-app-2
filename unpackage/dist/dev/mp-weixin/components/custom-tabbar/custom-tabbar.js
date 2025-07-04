"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "custom-tabbar",
  setup(__props) {
    const store = common_vendor.useStore();
    const currentPath = common_vendor.ref("");
    const tabList = [
      {
        pagePath: "pages/auth/index",
        iconPath: "/static/image/tabbar-auth@2x.png",
        selectedIconPath: "/static/image/tabbar-auth-active@2x.png",
        text: "初始认证"
      },
      {
        pagePath: "pages/delivery/index",
        iconPath: "/static/image/tabbar-delivery@2x.png",
        selectedIconPath: "/static/image/tabbar-delivery-active@2x.png",
        text: "包装出库"
      },
      {
        pagePath: "pages/index/index",
        iconPath: "/static/image/tabbar-home-active@2x.png",
        selectedIconPath: "/static/image/tabbar-home-active@2x.png",
        text: "主页"
      },
      {
        pagePath: "pages/recycle/detailList",
        iconPath: "/static/image/tabbar-recycle@2x.png",
        selectedIconPath: "/static/image/tabbar-recycle-active@2x.png",
        text: "回收复查",
        roles: [0, 1, 2]
        // 超级管理员 管理员 操作员
      },
      {
        pagePath: "pages/report/index",
        iconPath: "/static/image/tabbar-report@2x.png",
        selectedIconPath: "/static/image/tabbar-report-active@2x.png",
        text: "损坏申报",
        roles: [0, 1, 2]
        // 超级管理员 管理员 操作员
      }
    ];
    const roleName = common_vendor.index.getStorageSync("ROLE_KEY") || "";
    const filteredTabs = common_vendor.computed(() => {
      const userInfo = common_vendor.index.getStorageSync("userInfo") ? JSON.parse(common_vendor.index.getStorageSync("userInfo")) : {};
      if (roleName === "admin") {
        return tabList.filter(
          (item) => {
            var _a;
            return !(item == null ? void 0 : item.roles) || ((_a = item == null ? void 0 : item.roles) == null ? void 0 : _a.includes(userInfo.type));
          }
        );
      } else {
        return tabList;
      }
    });
    common_vendor.computed(() => store.getters.shouldShowTabBar);
    const updatePath = () => {
      var _a;
      common_vendor.index.__f__("log", "at components/custom-tabbar/custom-tabbar.vue:86", getCurrentPages().pop());
      currentPath.value = ((_a = getCurrentPages().pop()) == null ? void 0 : _a.route) || "";
    };
    common_vendor.onShow(updatePath);
    common_vendor.onMounted(() => {
      common_vendor.index.$on("switchTab", updatePath);
    });
    const switchTab = (item) => {
      common_vendor.index.reLaunch({ url: "/" + item.pagePath });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(filteredTabs.value, (item, index, i0) => {
          return {
            a: currentPath.value === item.pagePath ? item.selectedIconPath : item.iconPath,
            b: common_vendor.t(item.text),
            c: index,
            d: common_vendor.o(($event) => switchTab(item), index),
            e: common_vendor.n({
              active: currentPath.value === item.pagePath
            })
          };
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-51c48e3c"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/custom-tabbar/custom-tabbar.js.map
