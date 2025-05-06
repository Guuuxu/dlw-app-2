"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_outbound = require("../../../api/outbound.js");
if (!Math) {
  Empty();
}
const Empty = () => "../../../components/empty/empty.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const role = common_vendor.ref("");
    const list = common_vendor.ref([]);
    const page = common_vendor.ref({
      page: 1,
      per_page: 10
    });
    const total_count = common_vendor.ref(0);
    role.value = common_vendor.index.getStorageSync("ROLE_KEY");
    common_vendor.index.__f__("log", "at pages/web/delivery/index.vue:37", role.value);
    common_vendor.onLoad(() => {
      common_vendor.index.__f__("log", "at pages/web/delivery/index.vue:39", "onLoadonLoadonLoad");
      getList();
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at pages/web/delivery/index.vue:44", "onShowonShowonShowonShow");
    });
    const getList = async (isFresh) => {
      const res = await api_outbound.getOutboundList({
        ...page.value
      });
      common_vendor.index.stopPullDownRefresh();
      total_count.value = res.data.total_count;
      if (isFresh) {
        list.value = res.data.list;
      } else {
        list.value = list.value.concat(res.data.list);
      }
    };
    const goDetail = (item) => {
      common_vendor.index.navigateTo({
        url: "/pages/delivery/detailList?item=" + JSON.stringify(item)
      });
    };
    common_vendor.onPullDownRefresh(() => {
      page.value.page = 1;
      getList(true);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/web/delivery/index.vue:70", "onReachBottom");
      if (list.value.length = total_count.value) {
        loadMoreText.value = "没有更多数据了!";
        return;
      }
      this.showLoadMore = true;
      setTimeout(() => {
        getList();
      }, 300);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: list.value.length
      }, list.value.length ? {
        b: common_vendor.f(list.value, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.t(role.value === "admin" ? item.name : item.order_no),
            c: common_vendor.t(item.created_at),
            d: common_vendor.o(($event) => goDetail(item), item.id),
            e: item.id
          };
        }),
        c: common_assets._imports_0$1
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5b102759"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/web/delivery/index.js.map
