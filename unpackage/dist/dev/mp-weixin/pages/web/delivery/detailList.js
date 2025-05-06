"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_outbound = require("../../../api/outbound.js");
if (!Math) {
  Empty();
}
const Empty = () => "../../../components/empty/empty.js";
const _sfc_main = {
  __name: "detailList",
  setup(__props) {
    const list = common_vendor.ref([]);
    const page = common_vendor.ref({
      page: 1,
      per_page: 10
    });
    const total_count = common_vendor.ref(0);
    const row = common_vendor.ref({});
    common_vendor.onLoad((option) => {
      const item = JSON.parse(option.item);
      row.value = item;
      loadDetail();
    });
    const loadDetail = async (isfresh) => {
      try {
        const res = await api_outbound.getOutboundDetail(row.value.id);
        common_vendor.index.__f__("log", "at pages/web/delivery/detailList.vue:52", res);
        if (isfresh) {
          list.value = res.data.list;
        } else {
          list.value = list.value.concat(res.data.list);
        }
        total_count.value = res.data.total_count;
        common_vendor.index.stopPullDownRefresh();
      } catch (e) {
        common_vendor.index.stopPullDownRefresh();
      }
    };
    const handleScan = async () => {
      common_vendor.index.scanCode({
        success: async (res) => {
          try {
            const resScan = await api_outbound.scanOutbound({
              outbound: row.value.id,
              detail_no: res.result
            });
            common_vendor.index.showToast({
              title: "出库成功",
              icon: "none"
            });
            common_vendor.index.startPullDownRefresh();
          } catch ({ data }) {
            row.value.detail_no = res.result;
            common_vendor.index.__f__("log", "at pages/web/delivery/detailList.vue:104", "81", row.value);
            common_vendor.index.navigateTo({
              url: `/pages/delivery/deliveryError?item=${JSON.stringify(row.value)}&msg=${data.msg}`
            });
          }
        },
        fail: (err) => {
        }
      });
    };
    const handleFinish = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onPullDownRefresh(() => {
      page.value.page = 1;
      loadDetail(true);
    });
    common_vendor.onReachBottom(() => {
      common_vendor.index.__f__("log", "at pages/web/delivery/detailList.vue:146", "onReachBottom");
      if (list.value.length = total_count.value) {
        loadMoreText.value = "没有更多数据了!";
        return;
      }
      this.showLoadMore = true;
      setTimeout(() => {
        loadDetail();
      }, 300);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: list.value.length
      }, list.value.length ? {
        b: common_vendor.f(list.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.detail_no),
            b: common_vendor.t(item.limit_count),
            c: common_vendor.t(item.month_limit)
          };
        })
      } : {}, {
        c: common_vendor.o(handleScan),
        d: common_vendor.o(handleFinish)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4100b393"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/web/delivery/detailList.js.map
