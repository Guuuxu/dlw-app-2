"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_auth = require("../../api/auth.js");
if (!Math) {
  (Empty + common_vendor.unref(lsSkeleton))();
}
const Empty = () => "../../components/empty/empty.js";
const lsSkeleton = () => "../../components/ls-skeleton/ls-skeleton.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const page = common_vendor.ref({
      page: 1,
      per_page: 10
    });
    const isLoad = common_vendor.ref(false);
    const list = common_vendor.ref([]);
    const role = common_vendor.ref("");
    role.value = common_vendor.index.getStorageSync("ROLE_KEY");
    common_vendor.ref(0);
    const total_count = common_vendor.ref(0);
    const loadMoreText = common_vendor.ref("加载中...");
    const showLoadMore = common_vendor.ref(false);
    const skeleton = [
      40,
      "card-sm*4",
      40
    ];
    common_vendor.onShow(() => {
      isLoad.value = false;
      page.value.page = 1;
      role.value = common_vendor.index.getStorageSync("ROLE_KEY");
      common_vendor.index.__f__("log", "at pages/auth/index.vue:59", "onLoadonLoadonLoad");
      init();
    });
    common_vendor.onHide(() => {
      list.value = [];
    });
    const goCheck = (item) => {
      common_vendor.index.__f__("log", "at pages/auth/index.vue:69", item);
      const url = role.value === "admin" ? "/pages/auth/detailList?" : "/pages/auth/check?";
      common_vendor.index.navigateTo({
        url: `${url}?item=${JSON.stringify(item)}`
      });
    };
    const init = async (isFresh) => {
      try {
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
        total_count.value = res.data.total_count;
        isLoad.value = true;
      } catch (e) {
        isLoad.value = true;
      }
    };
    common_vendor.onPullDownRefresh(() => {
      page.value.page = 1;
      init(true);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/auth/index.vue:99", list.value.length, total_count.value);
      if (list.value.length === total_count.value) {
        common_vendor.index.__f__("log", "at pages/auth/index.vue:101", "没有更多数据了");
        loadMoreText.value = "没有更多数据了!";
        showLoadMore.value = true;
        return;
      }
      showLoadMore.value = true;
      common_vendor.index.__f__("log", "at pages/auth/index.vue:107", "onReachBottom");
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
      } : {}, {
        g: common_vendor.p({
          skeleton,
          loading: !isLoad.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3f748249"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/auth/index.js.map
