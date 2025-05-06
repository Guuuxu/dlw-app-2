"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_auth = require("../../../api/auth.js");
if (!Math) {
  Empty();
}
const Empty = () => "../../../components/empty/empty.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const page = common_vendor.ref({
      page: 1,
      per_page: 10
    });
    const list = common_vendor.ref([]);
    const role = common_vendor.ref("");
    common_vendor.ref(0);
    const total_count = common_vendor.ref(0);
    const loadMoreText = common_vendor.ref("加载中...");
    const showLoadMore = common_vendor.ref(false);
    common_vendor.onShow(() => {
      list.value = [];
      role.value = common_vendor.index.getStorageSync("ROLE_KEY");
      common_vendor.index.__f__("log", "at pages/web/auth/index.vue:47", "onShowonShowonShow", role.value);
      init();
    });
    common_vendor.onUnload(() => {
      list.value = [];
    });
    const goCheck = (item) => {
      common_vendor.index.__f__("log", "at pages/web/auth/index.vue:56", item);
      const url = role.value === "admin" ? "/pages/auth/detailList?" : "/pages/auth/check?";
      common_vendor.index.navigateTo({
        url: `${url}?item=${JSON.stringify(item)}`
      });
    };
    const init = async (isFresh) => {
      const res = await api_auth.getBoundList({
        ...page.value,
        type_name: ""
      });
      common_vendor.index.stopPullDownRefresh();
      if (isFresh) {
        list.value = res.data.list;
      } else {
        list.value = list.value.concat(res.data.list);
      }
      common_vendor.index.__f__("log", "at pages/web/auth/index.vue:74", list.value);
      total_count.value = res.data.total_count;
    };
    common_vendor.onPullDownRefresh(() => {
      page.value.page = 1;
      init(true);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/web/auth/index.vue:82", list.value.length, total_count.value);
      if (list.value.length === total_count.value) {
        common_vendor.index.__f__("log", "at pages/web/auth/index.vue:84", "没有更多数据了");
        loadMoreText.value = "没有更多数据了!";
        showLoadMore.value = true;
        return;
      }
      showLoadMore.value = true;
      common_vendor.index.__f__("log", "at pages/web/auth/index.vue:90", "onReachBottom");
      ++page.value.page;
      init();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: list.value.length
      }, list.value.length ? {
        b: common_vendor.f(list.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(index + 1)
          }, role.value == "web" ? {
            b: common_vendor.t(item.order_no)
          } : {
            c: common_vendor.t(item.type_name),
            d: common_vendor.t(item.start_no),
            e: common_vendor.t(item.end_no)
          }, {
            f: common_vendor.t(item.total_count),
            g: item.id,
            h: common_vendor.o(($event) => goCheck(item), item.id)
          });
        }),
        c: role.value == "web",
        d: common_assets._imports_0$1
      } : {}, {
        e: showLoadMore.value
      }, showLoadMore.value ? {
        f: common_vendor.t(loadMoreText.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c7725c0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/web/auth/index.js.map
