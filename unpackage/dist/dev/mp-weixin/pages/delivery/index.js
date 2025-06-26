"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_outbound = require("../../api/outbound.js");
if (!Math) {
  (Empty + common_vendor.unref(lsSkeleton))();
}
const lsSkeleton = () => "../../components/ls-skeleton/ls-skeleton.js";
const Empty = () => "../../components/empty/empty.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const role = common_vendor.ref("");
    const list = common_vendor.ref([]);
    const page = common_vendor.ref({
      page: 1,
      per_page: 10
    });
    const skeleton = [
      40,
      "card-sm*4",
      40
    ];
    const isLoad = common_vendor.ref(false);
    const loadMoreText = common_vendor.ref("加载中...");
    const showLoadMore = common_vendor.ref(false);
    const total_count = common_vendor.ref(0);
    common_vendor.index.__f__("log", "at pages/delivery/index.vue:49", role.value);
    common_vendor.onLoad(() => {
      isLoad.value = false;
      page.value.page = 1;
      role.value = common_vendor.index.getStorageSync("ROLE_KEY");
      getList();
    });
    common_vendor.onShow(() => {
    });
    common_vendor.onHide(() => {
    });
    const getList = async (isFresh) => {
      try {
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
        isLoad.value = true;
      } catch (e) {
        isLoad.value = true;
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
      common_vendor.index.__f__("log", "at pages/delivery/index.vue:90", "onReachBottom", list.value.length, total_count.value);
      if (list.value.length == total_count.value) {
        loadMoreText.value = "没有更多数据了!";
        return;
      }
      page.value.page++;
      showLoadMore.value = true;
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
            b: common_vendor.t(role.value == "admin" ? item.name : item.order_no),
            c: common_vendor.t(item.created_at),
            d: common_vendor.o(($event) => goDetail(item), item.id),
            e: item.id
          };
        }),
        c: common_assets._imports_0$1
      } : {}, {
        d: showLoadMore.value
      }, showLoadMore.value ? {
        e: common_vendor.t(loadMoreText.value)
      } : {}, {
        f: common_vendor.p({
          skeleton,
          loading: !isLoad.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-87751f05"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/delivery/index.js.map
